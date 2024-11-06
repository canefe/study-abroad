"use client";
import { Table } from "antd";

export default function ChoicesTable() {
  const columns = [
    {
      title: "Home Course",
      dataIndex: "homeCourse",
      key: "homeCourse",
      render: (text: string) => <p className="font-semibold">{text}</p>,
      rowScope: "row",
    },
    {
      title: "Choice 1",
      dataIndex: "abroadCourse1",
      key: "abroadCourse1",
    },
    {
      title: "Choice 2",
      dataIndex: "abroadCourse2",
      key: "abroadCourse2",
    },
    {
      title: "Choice 3",
      dataIndex: "abroadCourse3",
      key: "abroadCourse3",
    },
  ];

  // Uni Computer Science University of Glasgow Home Courses vs Abroad Courses
  const data = [
    {
      key: "1",
      homeCourse: "Object-Oriented Programming",
      abroadCourse1: "Introduction to Programming",
      abroadCourse2: "Programming 1",
      abroadCourse3: "Programming 2",
    },
    {
      key: "2",
      homeCourse: "Software Development",
      abroadCourse1: "Software Development 1",
      abroadCourse2: "Software Development 2",
      abroadCourse3: "Software Development 3",
    },
    {
      key: "3",
      homeCourse: "Web Development",
      abroadCourse1: "Web Development 1",
      abroadCourse2: "Web Development 2",
      abroadCourse3: "Web Development 3",
    },
    {
      key: "4",
      homeCourse: "Databases",
      abroadCourse1: "Databases 1",
      abroadCourse2: "Databases 2",
      abroadCourse3: "Databases 3",
    },
    {
      key: "5",
      homeCourse: "Computer Systems",
      abroadCourse1: "Computer Systems 1",
      abroadCourse2: "Computer Systems 2",
      abroadCourse3: "Computer Systems 3",
    },
  ];

  return (
    <div className="mt-4 flex space-x-5">
      <Table columns={columns} dataSource={data} bordered className="w-2/3" />
      <div className="h-[390px] w-1/3 overflow-scroll">
        <div className="grid grid-cols-1 gap-4">
          <AbroadCourseBox
            title="Introduction to Programming"
            university="University of Glasgow"
            course="Programming 1"
          />
          <AbroadCourseBox
            title="Software Development 1"
            university="University of Glasgow"
            course="Software Development 1"
          />
          <AbroadCourseBox
            title="Web Development 1"
            university="University of Glasgow"
            course="Web Development 1"
          />
          {[...Array(5)].map((_, index) => (
            <AbroadCourseBox
              key={index}
              title="Introduction to Programming"
              university="University of Glasgow"
              course="Programming 1"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const AbroadCourseBox = ({
  title,
  university,
  course,
}: {
  title: string;
  university: string;
  course: string;
}) => {
  return (
    <div className="cursor-pointer bg-slate-100 p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p>{university}</p>
      <p>Course: {course}</p>
    </div>
  );
};
