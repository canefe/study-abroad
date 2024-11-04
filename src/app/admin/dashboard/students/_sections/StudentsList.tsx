"use client";
import { Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function StudentList() {
  const [users] = api.students.getList.useSuspenseQuery();
  const utils = api.useUtils();

  const dataSource = users.map((student: any) => ({
    key: student.id,
    name: student.name,
    guid: student.guid,
    address: student.address,
  }));
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "GUID",
      dataIndex: "guid",
      key: "guid",
      render: (guid: string) => (
        <Link
          href={`/admin/dashboard/students/${guid}`}
          className="text-blue-500"
        >
          {guid}
        </Link>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table size="large" dataSource={dataSource} columns={columns} />
    </div>
  );
}
