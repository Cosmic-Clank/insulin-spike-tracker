import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonLabel, IonItem, IonThumbnail, IonImg, IonIcon, IonItemDivider } from "@ionic/react";
import React from "react";
import { usePersistentMealStore } from "../../stores/persistentMealStore";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { calculateChronicScore, calculateTotalCalories, calculateTotalCarbohydrates, calculateTotalSaturatedFat, getMealTimeString } from "../../utils";
import { useCurrentMealStore } from "../../stores/currentMealStore";
import AcuteScoreProgressbar from "../../components/AcuteScoreProgressbar";
import { Meal } from "../../types/Meal";
import { batteryCharging, chevronForward, chevronForwardCircle, flame, information, informationCircle, pizza } from "ionicons/icons";
import { NutrimentComponent } from "../../components/NutrimentComponent";

const Dashboard: React.FC = () => {
	const meals = usePersistentMealStore((s) => s.meals);
	const chronicScore = calculateChronicScore(meals);

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar className='ion-text-center'>
					<IonTitle>Dashboard</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className='ion-padding'>
				{meals.length === 0 ? (
					<IonText color='medium'>
						<IonCard
							style={{
								borderRadius: "16px",
								boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
								padding: "1.5rem 1rem",
								textAlign: "center",
								margin: "2rem auto",
								maxWidth: 350,
							}}>
							<IonCardHeader>
								<IonCardTitle style={{ fontSize: "1.2rem", fontWeight: 700 }}>No Meals Logged</IonCardTitle>
							</IonCardHeader>
							<IonCardContent>
								<IonText color='medium'>
									<p style={{ fontSize: "1rem", marginBottom: "1rem" }}>You haven't added any meals yet.</p>
									<p style={{ fontSize: "0.95rem" }}>
										Tap the <strong>Add Meal</strong> tab below to scan and log your first meal!
									</p>
								</IonText>
							</IonCardContent>
						</IonCard>
					</IonText>
				) : (
					<>
						{/* Featured Recent Meal */}
						<IonCard
							style={{
								borderRadius: "16px",
								margin: "0px",
								boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
							}}>
							<IonCardHeader>
								<IonCardTitle style={{ fontSize: "1.4rem", fontWeight: 700, textAlign: "center" }}>Chronic Score</IonCardTitle>
							</IonCardHeader>

							<IonCardContent style={{ paddingTop: "0.5rem" }}>
								<div style={{ width: 140, height: 140, margin: "0 auto" }}>
									<CircularProgressbar
										value={chronicScore}
										maxValue={100}
										text={`${chronicScore}`}
										styles={buildStyles({
											textSize: "2.2rem",
											pathColor: "#3498db",
											textColor: "#3498db",
											trailColor: "#dfe6f0",
										})}
									/>
								</div>

								<IonText color='medium'>
									<p style={{ marginTop: "1rem", textAlign: "center" }}>Chronic Score reflects your long-term meal choices, measuring how consistently your diet supports stable insulin and overall metabolic health.</p>
								</IonText>
							</IonCardContent>
						</IonCard>
						<IonItemDivider>
							<IonText color='medium' style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
								Recents
							</IonText>
						</IonItemDivider>

						{/* Other Meals */}
						{meals.map((meal) => {
							return <MealCard key={meal.id} meal={meal} />;
						})}
					</>
				)}
			</IonContent>
		</IonPage>
	);
};

export default Dashboard;

function MealCard({ meal }: { meal: Meal }) {
	const { getMealById } = usePersistentMealStore();
	const { setMeal } = useCurrentMealStore();

	const handleMealClick = (mealId: string) => {
		// Navigate to existing meal details
		const meal = getMealById(mealId);
		if (!meal) {
			return;
		}
		setMeal(meal);
	};

	return (
		<IonItem lines='none' onClick={() => handleMealClick(meal.id)} routerLink='/meals/new' key={meal.id} style={{ borderRadius: "16px", marginTop: "0.5rem" }}>
			<IonThumbnail slot='end' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
				<AcuteScoreProgressbar meal={meal} style={{ width: "100%", height: "100%", margin: "0 auto" }} />
			</IonThumbnail>
			<IonIcon slot='end' icon={chevronForward} size='small' />
			{/* {meal.image && (
				<IonThumbnail slot='start' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
					<IonImg src={meal.image ?? ""} alt='Meal Image' style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
				</IonThumbnail>
			)} */}

			<IonLabel>
				<h3>{meal.name}</h3>
				<p style={{ fontSize: "12px" }}>{getMealTimeString(meal)}</p>
				<NutrimentComponent nutrimentIcon={flame} nutrimentIconColor={"#ff5151ff"} nutrimentName={"Calories"} nutrimentValue={calculateTotalCalories(meal)} />
				<NutrimentComponent nutrimentIcon={pizza} nutrimentIconColor={"#ffcc00ff"} nutrimentName={"Carbs"} nutrimentValue={calculateTotalCarbohydrates(meal)} />
				<NutrimentComponent nutrimentIcon={batteryCharging} nutrimentIconColor={"#3880ff"} nutrimentName={"Sat. Fat"} nutrimentValue={calculateTotalSaturatedFat(meal)} />
			</IonLabel>
		</IonItem>
	);
}
