"use client";
import { api } from "@/trpc/react";
import { Button, Select } from "antd";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const [courses] = api.courses.getList.useSuspenseQuery();
  const [universities] = api.universities.getList.useSuspenseQuery();
  const [selectedUni, setSelectedUni] = useState("");
  const utils = api.useUtils();
  const createChoicesApi = api.choices.createChoice.useMutation({
    onSuccess: async () => {
      // refresh courses
      await utils.courses.invalidate();
    },
  });
  const removeChoicesApi = api.choices.removeChoice.useMutation({
    onSuccess: async () => {
      // refresh courses
      await utils.courses.invalidate();
    },
  });

  // remove University of Glasgow (home uni)
  let filteredUniversities = universities?.filter((university) => {
    return university.name !== "University of Glasgow";
  });

  if (!courses || !universities) {
    return <div>Loading...</div>;
  }

  // further filter universities to only show those that are not already chosen
  filteredUniversities = filteredUniversities?.filter((university) => {
    return !courses?.some((course) => {
      return course.abroadUniversity.id === university.id;
    });
  });

  // from courses, get the university
  let universityChoices = courses?.map((course) => course.abroadUniversity);
  // only obtain unique universities
  universityChoices = universityChoices.filter(
    (university, index, self) =>
      index ===
      self.findIndex(
        (t) => t.id === university.id && t.name === university.name,
      ),
  );

  function createChoices() {
    // selected uni
    if (selectedUni == "" || selectedUni == "Select a university") {
      alert("Please select a university");
      return;
    }

    createChoicesApi.mutate({
      homeUniversityId: 153,
      abroadUniversityId: universities.find(
        (university) => university.name === selectedUni,
      ).id,
    });
  }

  function removeChoices(abroadUniversityId: number) {
    // remove all choices related to the university
    removeChoicesApi.mutate({
      abroadUniversityId: abroadUniversityId,
    });
  }
  return (
    <div>
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <h2 className="mt-10 text-xl font-semibold">University Choices</h2>
      {courses && (
        <ul className="list flex flex-col gap-2">
          {universityChoices.map((university) => (
            <li key={university.id} className="flex items-center gap-1">
              <Link
                href={"/dashboard/my-choices/" + university.id}
                className="w-fit bg-slate-100 p-1 hover:bg-slate-200"
              >
                {university.name}
              </Link>
              <p
                className="cursor-pointer text-blue-300 hover:text-blue-500"
                onClick={() => removeChoices(university.id)}
              >
                Remove
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="my-5 border-b-2 border-t-2 border-gray-200"></div>
      {universityChoices.length < 3 && (
        <div className="flex w-1/2 flex-col items-start gap-3">
          <p>
            You can make up to 3 choices. You have made{" "}
            {universityChoices.length} choices.
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
  );
}
