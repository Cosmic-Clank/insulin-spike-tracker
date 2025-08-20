import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonLabel, IonItem, IonThumbnail, IonImg, IonIcon } from "@ionic/react";
import React from "react";
import { calculateAcuteScore, usePersistentMealStore } from "../../stores/persistentMealStore";
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
	const { getMealById } = usePersistentMealStore();
	const { setMeal } = useCurrentMealStore();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar className='ion-padding-top ion-text-center'>
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
								paddingBottom: "1rem",
								marginBottom: "1.5rem",
								boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
							}}>
							<IonCardHeader className='ion-margin' style={{ paddingBottom: 0 }}>
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
									<p
										style={{
											fontSize: "1rem",
											marginTop: "0.75rem",
											textAlign: "center",
										}}>
										Overall Chronic Score based on your meals
									</p>
								</IonText>
							</IonCardContent>
						</IonCard>

						<IonText color='medium' style={{ marginBottom: "1rem" }}>
							Meals
						</IonText>

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
		<IonItem lines='none' onClick={() => handleMealClick(meal.id)} routerLink='/meals/new' key={meal.id} style={{ borderRadius: "8px", marginBottom: "1rem", marginTop: "1rem" }}>
			<IonThumbnail slot='end' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
				<AcuteScoreProgressbar mealItems={meal.items} style={{ width: "100%", height: "100%", margin: "0 auto" }} />
			</IonThumbnail>
			<IonIcon slot='end' icon={chevronForward} size='small' />
			{meal.image && (
				<IonThumbnail slot='start' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
					<IonImg src={meal.image ?? ""} alt='Meal Image' style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
				</IonThumbnail>
			)}

			<IonLabel>
				<h2>{meal.name}</h2>
				<p>{getMealTimeString(meal)}</p>
				<NutrimentComponent nutrimentIcon={flame} nutrimentIconColor={"#ff5151ff"} nutrimentName={"Calories"} nutrimentValue={calculateTotalCalories(meal)} />
				<NutrimentComponent nutrimentIcon={pizza} nutrimentIconColor={"#ffcc00ff"} nutrimentName={"Carbs"} nutrimentValue={calculateTotalCarbohydrates(meal)} />
				<NutrimentComponent nutrimentIcon={batteryCharging} nutrimentIconColor={"#3880ff"} nutrimentName={"Sat. Fat"} nutrimentValue={calculateTotalSaturatedFat(meal)} />
			</IonLabel>
		</IonItem>
	);
}

{
	/* 
								<IonCard
									onClick={() => handleMealClick(meal.id)}
									routerLink='/meals/new'
									key={meal.id}
									className='ion-padding'
									style={{
										marginBottom: "1rem",
										borderRadius: "14px",
									}}>
									<IonCardHeader style={{ paddingBottom: "0.5rem" }}>
										<IonCardTitle style={{ fontSize: "1rem", fontWeight: 600 }}>{meal.name}</IonCardTitle>
									</IonCardHeader>

									<IonCardContent style={{ paddingTop: "0.5rem" }}>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												justifyContent: "center",
												marginBottom: "1rem",
											}}>
											<div style={{ width: 80, height: 80 }}>
												<AcuteScoreProgressbar mealItems={meal.items} />
											</div>
											<IonText color='medium'>
												<p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Acute Score</p>
											</IonText>
											<IonText color='medium'>
												<p style={{ fontSize: "0.8rem" }}>{meal.items.reduce((sum, item) => sum + item.kcalPerServing * item.amount, 0)} kcal</p>
											</IonText>
										</div>

										<div style={{ fontSize: "0.85rem", color: "#666" }}>
											{meal.items.map((item) => (
												<div
													key={item.id}
													style={{
														display: "flex",
														justifyContent: "space-between",
														marginBottom: "4px",
													}}>
													<IonText color='medium'>{item.name}</IonText>
													<div className='ion-margin-bottom' style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
														<IonLabel color='dark'>
															FII: {item.fii} | kcal: {item.kcalPerServing * item.amount}
														</IonLabel>
														<IonLabel color='medium'>
															{item.kcalPerServing}kcal * {item.amount}
															{item.servingUnit}
														</IonLabel>
													</div>
												</div>
											))}
										</div>

										<IonText color='medium'>
											<p
												style={{
													fontSize: "0.75rem",
													textAlign: "right",
													marginTop: "0.75rem",
													marginRight: "0.25rem",
												}}>
												{new Date(meal.timestamp).toLocaleString(undefined, {
													weekday: "short", // e.g. "Mon"
													year: "numeric",
													month: "short", // e.g. "Jun"
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</IonText>
									</IonCardContent>
								</IonCard> 
								*/
}
