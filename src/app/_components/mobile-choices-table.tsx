// Taken from https://codepen.io/AllThingsSmitty/pen/MyqmdM
// it is read-only version of choices table for mobile view

import "@/styles/mobile-choices-table.css";

import React from "react";

type Choice = {
	homeCourse: string;
	firstChoice: string;
	secondChoice: string;
	thirdChoice: string;
};

type MobileChoicesTableProps = {
	choices: Choice[];
};

export default function MobileChoicesTable({
	choices,
}: MobileChoicesTableProps) {
	return (
		<table id="mobile-table">
			<thead>
				<tr>
					<th scope="col">Home Course</th>
					<th scope="col">1st Choice</th>
					<th scope="col">2nd Choice</th>
					<th scope="col">3rd Choice</th>
				</tr>
			</thead>
			<tbody>
				{choices.map((choice, index) => (
					<tr key={index}>
						<td data-label="Home Course">{choice.homeCourse}</td>
						<td data-label="1st Choice">{choice.firstChoice}</td>
						<td data-label="2nd Choice">{choice.secondChoice}</td>
						<td data-label="3rd Choice">{choice.thirdChoice}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
