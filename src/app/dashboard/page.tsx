"use client";
import { api } from "@/trpc/react";
import { Button, Select, Table, Tag } from "antd";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [applications] = api.applications.getList.useSuspenseQuery();
  const [universities] = api.universities.getList.useSuspenseQuery();
  const [selectedUni, setSelectedUni] = useState("");
  const utils = api.useUtils();
  const createChoicesApi = api.applications.create.useMutation({
    onSuccess: async () => {
      // refresh courses
      toast.success("Application created successfully");
      await utils.applications.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const removeChoicesApi = api.applications.remove.useMutation({
    onSuccess: async () => {
      // refresh courses
      await utils.applications.invalidate();
    },
  });

  // remove University of Glasgow (home uni)
  let filteredUniversities = universities?.filter((university) => {
    return university.name !== "University of Glasgow";
  });

  if (!applications || !universities) {
    return <div>Loading...</div>;
  }

  // further filter universities to only show those that are not already chosen
  filteredUniversities = filteredUniversities?.filter((university) => {
    return !applications?.some((application) => {
      return application.abroadUniversityId === university.id;
    });
  });

  function createChoices() {
    // selected uni
    if (selectedUni == "" || selectedUni == "Select a university") {
      toast.error("Please select a university");
      return;
    }

    createChoicesApi.mutate({
      abroadUniversityId: universities.find(
        (university) => university.name === selectedUni,
      ).id,
    });
  }

  function removeChoices(applicationId: number) {
    // remove all choices related to the university
    removeChoicesApi.mutate({
      applicationId: applicationId,
    });
  }
  return (
    <div>
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <div className="flex gap-2">
        <div className="mt-10 flex w-1/2 flex-col gap-2">
          <h2 className="text-xl font-semibold">University Choices</h2>
          <Table
            dataSource={applications}
            size={"small"}
            pagination={false}
            columns={[
              {
                title: "University",
                dataIndex: ["abroadUniversity", "name"],
                key: "abroadUniversityname",
                render: (text, record) => (
                  <Link
                    href={"/dashboard/my-choices/" + record.id}
                    className="w-fit bg-slate-100 p-1 hover:bg-slate-200"
                  >
                    {record.abroadUniversity.name}
                  </Link>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (text, record) => (
                  <Tag
                    color={
                      record.status === "DRAFT"
                        ? "blue"
                        : record.status === "PENDING"
                          ? "orange"
                          : record.status === "ACCEPTED"
                            ? "green"
                            : "red"
                    }
                  >
                    {record.status}
                  </Tag>
                ),
              },
              {
                title: "Action",
                key: "action",
                render: (text, record) => (
                  <Button
                    onClick={() => removeChoices(record.id)}
                    type="primary"
                    danger
                  >
                    Remove
                  </Button>
                ),
              },
            ]}
          />
          <div className="my-5 border-b-2 border-t-2 border-gray-200"></div>
          {applications.length < 3 && (
            <div className="flex w-2/3 flex-col items-start gap-3">
              <p>
                You can make up to 3 choices. You have made{" "}
                {applications.length} choices.
              </p>
              <Select
                showSearch
                defaultValue={"Select a university"}
                className="w-full"
                filterOption={(input, option) =>
                  String(option?.value ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onSelect={(value) => {
                  setSelectedUni(value);
                }}
              >
                {filteredUniversities?.map((university) => (
                  <Select.Option key={university.id} value={university.name}>
                    {university.name}
                  </Select.Option>
                ))}
              </Select>
              <Button onClick={createChoices}>Create new Choices</Button>
            </div>
          )}
        </div>
        <div className="mt-10 flex w-1/2 flex-col gap-2">
          <h2 className="text-xl font-semibold">Latest Announcements</h2>
          {[1, 2, 3].map((feedback) => (
            <div
              key={feedback}
              className="flex flex-col gap-2 rounded-md bg-slate-100 p-3"
            >
              <p className="font-semibold">Feedback {feedback}</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
