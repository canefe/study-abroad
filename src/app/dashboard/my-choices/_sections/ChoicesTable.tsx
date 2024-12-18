"use client";
import { api } from "@/trpc/react";
import { Button, FloatButton, Table } from "antd";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { getCourseNameById, useCombinedRefs } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

export default function ChoicesTable({ abroadId }: { abroadId: number }) {
  const [courses] = api.courses.getList.useSuspenseQuery();
  const abroadCoursesQuery = api.courses.getCourses.useQuery({
    id: abroadId,
  });
  const [sidebarHeight, setSidebarHeight] = useState("auto"); // Sidebar height state
  const tableRef = useRef(null); // Reference to the table
  const [activeId, setActiveId] = useState(null);
  const pathname = usePathname();

  const utils = api.useUtils();
  const saveChoicesApi = api.choices.saveChoiceChanges.useMutation({
    onSuccess: async () => {
      // refresh courses
      await utils.courses.invalidate();
    },
  });

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const [choices, setChoices] = useState({}); // Tracks the selected choices for each home course
  const abroadCourses = abroadCoursesQuery.data || [];

  // Prepare the table data
  const dataSource = courses.map((course) => ({
    key: course.homeCourseId,
    id: course.homeCourseId,
    homeCourse: course.homeCourse?.name,
    primaryChoice: choices[course.homeCourseId]?.primary || "No choice",
    alternativeChoice1: choices[course.homeCourseId]?.alt1 || "No choice",
    alternativeChoice2: choices[course.homeCourseId]?.alt2 || "No choice",
  }));

  // dont display duplicate homeCourse
  const filteredDataSource = dataSource.filter(
    (course, index, self) =>
      index === self.findIndex((t) => t.homeCourse === course.homeCourse),
  );

  // Columns for the table
  const columns = [
    {
      title: "Home Course",
      dataIndex: "homeCourse",
      key: "homeCourse",
      render: (text) => <p className="font-semibold">{text}</p>,
    },
    ...["1st Choice", "2nd Choice", "3rd Choice"].map((title, idx) => ({
      title,
      key: title.toLowerCase().replace(" ", ""),
      render: (_, record) => {
        const choiceType = ["primary", "alt1", "alt2"][idx];
        return (
          <ChoiceSlot
            id={`${record.id}-${choiceType}`}
            choice={choices[record.id]?.[choiceType]}
            onDrop={(courseId) => {
              // check all choices to see if the course is already selected and remove it if it is
              console.log("Dropping choice", record.id, choiceType, courseId);
              handleChoiceUpdate(record.id, choiceType, courseId);
            }}
            onRemove={() => {
              console.log("Removing choice", record.id, choiceType);
              handleChoiceUpdate(record.id, choiceType, null);
            }}
          />
        );
      },
    })),
  ];

  // Handle drag-and-drop updates
  const handleChoiceUpdate = (homeCourseId, choiceType, abroadCourseId) => {
    console.log("Updating choice", homeCourseId, choiceType, abroadCourseId);
    setChoices((prev) => ({
      ...prev,
      [homeCourseId]: {
        ...prev[homeCourseId],
        [choiceType]: abroadCourseId,
      },
    }));
    console.log(choices);
  };

  // Handle drag-end events
  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const [homeCourseId, choiceType] = over.id.split("-");
    // check all choices to see if the course is already selected and remove it if it is or swap if it is
    Object.entries(choices).forEach(([courseId, choice]) => {
      if (choice.primary === active.id) {
        handleChoiceUpdate(courseId, "primary", null);
      }
      if (choice.alt1 === active.id) {
        handleChoiceUpdate(courseId, "alt1", null);
      }
      if (choice.alt2 === active.id) {
        handleChoiceUpdate(courseId, "alt2", null);
      }
    });
    handleChoiceUpdate(homeCourseId, choiceType, active.id);
    updateSidebarHeight();
  };

  // Filter out courses that are already selected
  const selectedCourseIds = new Set(
    Object.values(choices).flatMap((choice) => Object.values(choice) || []),
  );
  const availableAbroadCourses = abroadCourses.filter(
    (course) => !selectedCourseIds.has(course.id),
  );

  const updateSidebarHeight = () => {
    if (tableRef.current) {
      console.log("Updating sidebar height to" + tableRef.current.offsetHeight);
      setSidebarHeight(`${tableRef.current.offsetHeight}px`);
    }
  };

  useEffect(() => {
    // Update height on initial render
    updateSidebarHeight();

    // Update height on window resize
    window.addEventListener("resize", updateSidebarHeight);

    return () => window.removeEventListener("resize", updateSidebarHeight);
  }, []);

  // fix when routing distrupts sidebar height

  useEffect(() => {
    const handleRouteChange = () => {
      // Delay the height update to wait for DOM rendering
      setTimeout(() => {
        updateSidebarHeight();
      }, 2000); // Adjust the delay as needed
    };

    handleRouteChange(); // Trigger on initial load
  }, [pathname]); // Trigger when the route changes

  // save changed
  function saveChanges() {
    // for every choices, mutate
    Object.entries(choices).forEach(([homeCourseId, choice]) => {
      saveChoicesApi.mutate({
        homeUniversityId: courses.find(
          (course) => course.homeCourseId === parseInt(homeCourseId),
        ).homeCourse.universityId,
        abroadUniversityId: abroadId,
        primaryCourseId: choice.primary,
        alternativeCourse1Id: choice.alt1,
        alternativeCourse2Id: choice.alt2,
      });
    });
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="mt-4 flex space-x-5">
        {/* Table for Home Courses */}
        <div ref={tableRef} className="h-fit flex-1">
          <Table
            columns={columns}
            dataSource={filteredDataSource}
            bordered
            className="-z-0"
            pagination={false}
          />
        </div>
        {/* Sidebar for Available Courses */}
        <div>
          {Object.keys(choices).length > 0 && (
            <div
              className="cursor-pointer bg-green-500 p-3 text-center text-white"
              onClick={saveChanges}
            >
              Save
            </div>
          )}
          <div
            className="relative !z-0 overflow-auto rounded bg-gray-50 p-3"
            style={{ height: sidebarHeight }}
          >
            <div className="grid grid-cols-1 gap-4">
              {availableAbroadCourses.map((course) => (
                <DraggableCourse
                  key={course.id}
                  id={course.id}
                  title={course.name}
                  university={course.university.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <DraggedCourse
            id={activeId}
            title={
              abroadCourses.find((course) => course.id === activeId)?.name ||
              "Unknown"
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

const DraggedCourse = ({ title }) => {
  return (
    <div className="w-fit cursor-pointer bg-blue-100 p-5 shadow-lg">
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
};

// Droppable and draggable choice slot
const ChoiceSlot = ({ id, choice, onDrop, onRemove }) => {
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
  } = useDraggable({ id: choice });

  const isDraggable = !!choice;
  const draggableStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const combinedRef = useCombinedRefs(setDraggableRef, setDroppableRef);
  const draggableAttributes = isDraggable
    ? { ...attributes, ...listeners }
    : {};

  return (
    <div
      ref={combinedRef}
      style={isDraggable ? draggableStyle : undefined}
      className={`w-[200px] border-2 border-dashed p-5 ${
        isOver ? "border-green-500" : "border-gray-300"
      }`}
      {...draggableAttributes}
    >
      <p className={choice ? "font-semibold" : "text-red-500"}>
        {getCourseNameById(choice, 2) || "No choice"}
        {isOver ? " (Drop here)" : ""}
      </p>
    </div>
  );
};

// Draggable course box
const DraggableCourse = ({ id, title, university }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-pointer bg-slate-100 p-5 hover:bg-blue-100"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p>{university}</p>
    </div>
  );
};
