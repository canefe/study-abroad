"use client";
import { api } from "@/trpc/react";
import { Button, Table } from "antd";

export default function FlaggedCoursesList() {
  const getCoursesApi = api.courses.getFlaggedList;
  const { data, error } = getCoursesApi.useQuery();

  const columns = [
    {
      title: "Course Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "University",
      dataIndex: ["university", "name"],
      key: "university",
    },
    {
      title: "Created by",
      dataIndex: ["createdBy"],
      key: "createdBy",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "",
      render: () => (
        <div className="grid grid-cols-3 gap-2">
          <Button href="#" className="text-red-500">
            Delete
          </Button>
          <Button href="#" className="text-blue-500">
            Unflag
          </Button>
          <Button href="#" className="text-green-500">
            Verify Course
          </Button>
          <Button className="col-span-3 text-yellow-500">
            Ban Student from Creating Courses
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="container">
      <p className="text-gray-500">
        Flagged courses are courses that have been reported by users.
        Coordinators should review these courses and determine whether they
        should be deleted or unflagged.
      </p>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{
          hideOnSinglePage: true,
        }}
      />
    </div>
  );
}
