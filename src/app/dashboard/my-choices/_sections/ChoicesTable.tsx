"use client";
import { api } from "@/trpc/react";
import { Table } from "antd";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";

export default function ChoicesTable() {
  const [courses] = api.courses.getList.useSuspenseQuery();
  const [choices, setChoices] = useState({});
  const utils = api.useUtils();

  /*
  model CourseChoice {
    id             Int    @id @default(autoincrement())
    userId         String
    homeCourseId   Int
    abroadCourseId Int
    status         String

    user         User   @relation(fields: [userId], references: [id])
    homeCourse   Course @relation("HomeCourse", fields: [homeCourseId], references: [id])
    abroadCourse Course @relation("AbroadCourse", fields: [abroadCourseId], references: [id])
}
  */
  // List of courses
  const dataSource = courses.map((course) => ({
    key: course.homeCourseId,
    id: course.homeCourseId,
    homeCourse: course.homeCourse?.name,
    primaryChoice: course.primaryCourse?.name || "No choice",
    alternativeChoice1: course.alternativeCourse1?.name || "No choice",
    alternativeChoice2: course.alternativeCourse2?.name || "No choice",
  }));

  const columns = [
    {
      title: "Home Course",
      dataIndex: "homeCourse",
      key: "homeCourse",
      render: (text) => <p className="font-semibold">{text}</p>,
    },
    {
      title: "Primary Choice",
      dataIndex: "primaryChoice",
      key: "primaryChoice",
      render: (text, record) => (
        <Droppable id={`${record.id}-primary`}>
          <p
            className={
              choices[record.id]?.primary ? "font-semibold" : "text-red-500"
            }
          >
            {choices[record.id]?.primary || "No choice"}
          </p>
        </Droppable>
      ),
    },
    {
      title: "Alternative Choice 1",
      dataIndex: "alternativeChoice1",
      key: "alternativeChoice1",
      render: (text, record) => (
        <Droppable id={`${record.id}-alt1`}>
          <p
            className={
              choices[record.id]?.alt1 ? "font-semibold" : "text-red-500"
            }
          >
            {choices[record.id]?.alt1 || "No choice"}
          </p>
        </Droppable>
      ),
    },
    {
      title: "Alternative Choice 2",
      dataIndex: "alternativeChoice2",
      key: "alternativeChoice2",
      render: (text, record) => (
        <Droppable id={`${record.id}-alt2`}>
          <p
            className={
              choices[record.id]?.alt2 ? "font-semibold" : "text-red-500"
            }
          >
            {choices[record.id]?.alt2 || "No choice"}
          </p>
        </Droppable>
      ),
    },
  ];

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over) {
      const [homeCourseId, choiceType] = over.id.split("-"); // Extract the homeCourse ID and choice type
      const abroadCourseId = active.id;

      setChoices((prevChoices) => {
        const updatedChoices = { ...prevChoices };
        if (!updatedChoices[homeCourseId]) {
          updatedChoices[homeCourseId] = {
            primary: null,
            alt1: null,
            alt2: null,
          };
        }

        // Update the appropriate choice type
        updatedChoices[homeCourseId][choiceType] = abroadCourseId;

        return updatedChoices;
      });
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="mt-4 flex space-x-5">
        <Table
          columns={columns}
          dataSource={dataSource}
          bordered
          className="-z-0 w-2/3"
        />
        <div className="z-10 h-[390px] w-1/3">
          <div className="grid grid-cols-1 gap-4">
            <AbroadCourseBox
              id={1}
              title="Introduction to Programming"
              university="University of Glasgow"
              course="Programming 1"
            />
            <AbroadCourseBox
              id={2}
              title="Software Development 1"
              university="University of Glasgow"
              course="Software Development 1"
            />
            <AbroadCourseBox
              id={3}
              title="Web Development 1"
              university="University of Glasgow"
              course="Web Development 1"
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
}

const Droppable = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id: number;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed p-5 ${
        isOver ? "border-green-500" : "border-gray-300"
      }`}
    >
      {children}
    </div>
  );
};

const AbroadCourseBox = ({
  title,
  university,
  course,
  id,
}: {
  title: string;
  university: string;
  course: string;
  id: number;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: title,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  return (
    <div
      className="z-50 cursor-pointer bg-slate-100 p-5"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p>{university}</p>
      <p>Course: {course}</p>
      {id}
    </div>
  );
};
