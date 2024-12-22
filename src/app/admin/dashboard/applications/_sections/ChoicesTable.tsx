"use client";
import { api } from "@/trpc/react";
import { Avatar, Button, FloatButton, Skeleton, Spin, Table, Tag } from "antd";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { getCourseNameById, useCombinedRefs } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import { Cross, Trash } from "lucide-react";
import { Cross1Icon } from "@radix-ui/react-icons";
import UserAvatar from "@/app/dashboard/_sections/avatar";
import dayjs from "dayjs";
import CommentSection from "@/app/_components/comment-section";

export default function ChoicesTable({
  applicationId,
}: {
  applicationId: number;
}) {
  // if admin the session will be admin not the user, use the admin api instead
  const application = api.applications.getAdmin.useQuery(
    {
      applicationId: applicationId,
    },
    {
      refetchInterval: 10000,
    },
  );
  const applicationData = application.data || [];
  const abroadCoursesQuery = api.courses.getCourses.useQuery({
    id: applicationData.abroadUniversityId,
  });
  const user = api.students.me.useQuery();
  const userData = user.data || [];
  const [sidebarHeight, setSidebarHeight] = useState("auto"); // Sidebar height state
  const tableRef = useRef(null); // Reference to the table
  const [activeId, setActiveId] = useState(null);
  const pathname = usePathname();

  const utils = api.useUtils();

  const [choices, setChoices] = useState({}); // Tracks the selected choices for each home course
  const abroadCourses = abroadCoursesQuery.data || [];
  console.log(abroadCourses);
  // Prepare the table data

  const dataSource =
    application.data?.courseChoices.map((choice) => ({
      id: choice.homeCourse.id,
      homeCourse: choice.homeCourse.name,
    })) || [];

  // dont display duplicate homeCourse
  const filteredDataSource = dataSource.filter(
    (course, index, self) =>
      index === self.findIndex((t) => t.homeCourse === course.homeCourse),
  );

  // only clientside, it will be added  on the choiceSlot component singular removal from choices
  const removeChoices = async (homeCourseId: number, slot: string) => {
    // remove all choices related to the university
    handleChoiceUpdate(homeCourseId, slot, null);
  };

  // Columns for the table
  const columns = [
    {
      title: "Home Course",
      dataIndex: "homeCourse",
      key: "homeCourse",
      render: (text, record) => <p className="font-semibold">{text}</p>,
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
              removeChoices(record.id, choiceType);
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

  // update choices according to applications.courseChoices
  useEffect(() => {
    const newChoices = {};
    applicationData.courseChoices?.forEach((choice) => {
      newChoices[choice.homeCourse.id] = {
        primary: choice.primaryCourse?.id,
        alt1: choice.alternativeCourse1?.id,
        alt2: choice.alternativeCourse2?.id,
      };
    });
    setChoices(newChoices);
  }, [applicationData]);

  const updateSidebarHeight = () => {
    if (tableRef.current) {
      const tableHeight = tableRef.current.offsetHeight;
      setSidebarHeight(`${tableHeight}px`);
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

  // when application load updateSidebarHeight
  useEffect(() => {
    updateSidebarHeight();
  }, [application.isLoading]);

  if (application.isLoading || abroadCoursesQuery.isLoading)
    return (
      <Skeleton
        active
        paragraph={{ rows: 5 }}
        title={{ width: "100%" }}
        className="w-full"
      />
    );

  return (
    <>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex flex-col rounded border p-3 text-lg font-medium">
          <p>{application.data?.abroadUniversity.name}</p>
          <p>{application.data?.user?.name}</p>
          <p>{application.data?.user?.guid}</p>
        </div>

        <h2
          className="bg-gray-100 p-2 text-lg font-bold uppercase text-white"
          style={{
            backgroundColor:
              application.data?.status.toLocaleLowerCase() === "draft"
                ? "#f6e05e"
                : application.data?.status.toLocaleLowerCase() === "submitted"
                  ? "#3182ce"
                  : application.data?.status.toLocaleLowerCase() === "approved"
                    ? "#38a169"
                    : "#e53e3e",
          }}
        >
          {application.data?.status}
        </h2>
      </div>
      <div className="mt-4 flex space-x-5">
        {/* Table for Home Courses */}
        <div ref={tableRef} className="h-fit flex-1">
          <Table
            size={"small"}
            columns={columns}
            dataSource={filteredDataSource.sort((a, b) =>
              a.id > b.id ? 1 : -1,
            )}
            loading={application.isLoading || abroadCoursesQuery.isLoading}
            bordered
            pagination={false}
          />
        </div>
        {/* Sidebar for Available Courses */}
        <div>
          <div
            className="relative !z-0 w-full overflow-auto rounded bg-gray-50 p-3"
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
      {/* Comment-like feedback section where student and admin can discuss */}
      <CommentSection
        messages={application.data?.messages}
        admin={true}
        applicationId={applicationId}
        user={userData}
      />
    </>
  );
}

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
    <>
      <div
        ref={combinedRef}
        style={isDraggable ? draggableStyle : undefined}
        className={`w-fit border-2 border-dashed p-2 ${
          isOver ? "border-green-500" : "border-gray-300"
        }`}
        {...draggableAttributes}
      >
        <p className={choice ? "font-regular" : "text-red-500"}>
          {getCourseNameById(choice, 2) || "No choice"}
          {isOver ? " (Drop here)" : ""}
        </p>
      </div>
    </>
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
      className="cursor-pointer bg-gray-200 p-3 hover:bg-blue-100"
    >
      <h2 className="text-md font-semibold">{title}</h2>
      <p>{university}</p>
    </div>
  );
};
