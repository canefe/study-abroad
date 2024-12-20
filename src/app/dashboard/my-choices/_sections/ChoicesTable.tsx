"use client";
import { api } from "@/trpc/react";
import { Button, FloatButton, Skeleton, Spin, Table } from "antd";
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

export default function ChoicesTable({
  applicationId,
}: {
  applicationId: number;
}) {
  const application = api.applications.get.useQuery({
    applicationId: applicationId,
  });
  const applicationData = application.data || [];
  const submitApplicationApi = api.applications.submit.useMutation({
    onSuccess: async () => {
      // refresh courses
      await utils.applications.invalidate();
    },
  });
  const withdrawApplicationApi = api.applications.withdraw.useMutation({
    onSuccess: async () => {
      // refresh courses
      await utils.applications.invalidate();
    },
  });
  const abroadCoursesQuery = api.courses.getCourses.useQuery({
    id: applicationData.abroadUniversityId,
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

  // save changed
  async function saveChanges() {
    // for every choices, mutate
    try {
      await Object.entries(choices).forEach(([homeCourseId, choice]) => {
        saveChoicesApi.mutate({
          homeCourseId: parseInt(homeCourseId),
          abroadUniversityId: application.data.abroadUniversityId,
          primaryCourseId: choice.primary,
          alternativeCourse1Id: choice.alt1,
          alternativeCourse2Id: choice.alt2,
        });
      });
    } catch (error) {
      toast.error("Failed to save changes");
      return Promise.reject();
    }
  }

  // Function to validate choices before submitting
  function validateChoices() {
    // Check if all choices are filled
    console.log("Choices filled:");
    if (Object.keys(choices).length === 0) {
      return false;
    }
    if (
      Object.values(choices).some((choice) => Object.values(choice).length < 3)
    ) {
      return false;
    }
    const isChoicesFilled = Object.values(choices).every(
      (choice) =>
        choice.primary !== null && choice.alt1 !== null && choice.alt2 !== null,
    );
    // also check if they are undefined
    if (
      Object.values(choices).some(
        (choice) =>
          choice.primary === undefined ||
          choice.alt1 === undefined ||
          choice.alt2 === undefined,
      )
    ) {
      return false;
    }
    // log every choice and their values
    console.log(choices);

    return isChoicesFilled;
  }

  // Function to submit the choices
  const submit = async () => {
    if (await validateChoices()) {
      submitApplicationApi.mutate({
        applicationId: applicationId,
      });
    } else {
      toast.error("Please fill all choices before submitting");
    }
  };

  async function onSubmit() {
    if (await validateChoices()) {
      // Submit the choices
      toast.promise(
        submit(),
        {
          loading: "Saving changes...",
          success: "Changes saved successfully",
          error: "Failed to save changes",
        },
        {
          style: {
            minWidth: "250px",
          },
        },
      );
    } else {
      // Show error message
      toast.error("Please fill all choices before submitting");
    }
  }

  const withdraw = async () => {
    withdrawApplicationApi.mutate({
      applicationId: applicationId,
    });
  };

  async function onWithdraw() {
    toast.promise(
      withdraw(),
      {
        loading: "Withdrawing...",
        success: "Withdrawn successfully",
        error: "Failed to withdraw",
      },
      {
        style: {
          minWidth: "250px",
        },
      },
    );
  }

  const saveDraft = async () => {
    await saveChanges();
    const whatSaved =
      application.data?.status.toLowerCase() === "draft"
        ? "Draft"
        : "Application";
    toast.success(whatSaved + " saved successfully");
  };

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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex w-full items-center justify-between gap-2">
        <h2 className="rounded border p-3 text-xl font-medium">
          {application.data?.abroadUniversity.name}
        </h2>
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
        <div className="flex gap-2">
          {/* Save Draft Button */}
          <Button
            className="cursor-pointer"
            onClick={saveDraft}
            type={"dashed"}
            size="large"
            loading={
              // Show loading state if the mutation is in progress
              // utils.choices.saveChoiceChanges.isMutating returns boolean and number
              !saveChoicesApi.isSuccess && saveChoicesApi.isPending
            }
          >
            {application.data?.status.toLowerCase() === "draft"
              ? "Save Draft"
              : "Update Application"}
          </Button>
          {/* Submit Button */}
          {application.data?.status.toLocaleLowerCase() !== "submitted" ? (
            <Button
              className="cursor-pointer text-white"
              onClick={onSubmit}
              size="large"
              type={"primary"}
              loading={
                // Show loading state if the mutation is in progress
                // utils.choices.saveChoiceChanges.isMutating returns boolean and number
                !saveChoicesApi.isSuccess && saveChoicesApi.isPending
              }
            >
              Submit
            </Button>
          ) : (
            <Button
              className="cursor-pointer text-white"
              onClick={onWithdraw}
              size="large"
              type={"primary"}
              loading={
                // Show loading state if the mutation is in progress
                // utils.choices.saveChoiceChanges.isMutating returns boolean and number
                !withdrawApplicationApi.isSuccess &&
                withdrawApplicationApi.isPending
              }
            >
              Withdraw
            </Button>
          )}
        </div>
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
    <>
      {choice && (
        <Cross1Icon
          color="white"
          className="absolute right-0 top-0 cursor-pointer bg-red-500 hover:bg-red-700"
          onClick={onRemove}
        />
      )}
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
