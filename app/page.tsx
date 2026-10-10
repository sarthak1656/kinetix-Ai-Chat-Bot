import React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="">
      <h2 className="">Hello world</h2>
      <UserButton />
    </div>
  );
}
