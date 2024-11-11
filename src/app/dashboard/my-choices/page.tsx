"use client";
import { DndContext } from "@dnd-kit/core";
import ChoicesTable from "./_sections/ChoicesTable";
import { useState } from "react";

export default function MyChoices() {
  return (
    <>
      <h1 className="text-3xl font-semibold">My Choices</h1>
      <ChoicesTable />
    </>
  );
}
