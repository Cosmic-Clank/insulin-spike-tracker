import { IonIcon } from "@ionic/react";

export function NutrimentComponent({ nutrimentName, nutrimentValue, nutrimentIcon, nutrimentIconColor }: { nutrimentName: string; nutrimentValue: number | string; nutrimentIcon: string; nutrimentIconColor: string }) {
	return (
		<div
			style={{
				display: "inline-flex",
				alignItems: "center",
				background: "#4d4d4d89",
				borderRadius: "16px",
				padding: "6px 10px",
				marginRight: "4px",
				marginBottom: "4px",
				boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
				fontSize: "15px",
				gap: "6px",
			}}>
			<IonIcon icon={nutrimentIcon} style={{ fontSize: "12px", color: nutrimentIconColor }} />
			<span style={{ fontSize: "11px", fontWeight: 500, color: "#ffffff7e" }}>{nutrimentName}:</span>
			<span style={{ fontSize: "11px", fontWeight: 600, color: "#ffffff96" }}>{nutrimentValue}</span>
		</div>
	);
}
