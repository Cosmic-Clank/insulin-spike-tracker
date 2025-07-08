import React from "react";
import { MealItem } from "../types/MealItem";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { calculateAcuteScore } from "../stores/persistentMealStore";

function AcuteScoreProgressbar({ style, mealItems }: { style?: React.CSSProperties; mealItems: MealItem[] }) {
	const acuteScore = calculateAcuteScore(mealItems);
	return (
		<div style={{ ...style, display: "flex", justifyContent: "center", alignItems: "center" }}>
			<CircularProgressbar
				value={acuteScore}
				maxValue={100}
				text={`${acuteScore}`}
				styles={buildStyles({
					textSize: "2.2rem",
					pathColor: acuteScore < 35 ? "#2ecc71" : acuteScore < 60 ? "#f1c40f" : "#e74c3c",
					textColor: acuteScore < 35 ? "#2ecc71" : acuteScore < 60 ? "#f1c40f" : "#e74c3c",
					trailColor: "#dfe6f0",
				})}
			/>
		</div>
	);
}

export default AcuteScoreProgressbar;
