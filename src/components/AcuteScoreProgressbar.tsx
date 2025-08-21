import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { calculateAcuteScore } from "../utils";
import { Meal } from "../types/Meal";

function AcuteScoreProgressbar({ style, meal }: { style?: React.CSSProperties; meal: Meal }) {
	const acuteScore = calculateAcuteScore(meal);
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
