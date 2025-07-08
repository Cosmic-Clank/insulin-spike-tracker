import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonLabel } from "@ionic/react";
import React from "react";
import { calculateAcuteScore, usePersistentMealStore } from "../../stores/persistentMealStore";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { calculateChronicScore } from "../../utils";

const Dashboard: React.FC = () => {
	const meals = usePersistentMealStore((s) => s.meals);
	const chronicScore = calculateChronicScore(meals);

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
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
							Previous Meals
						</IonText>

						{/* Other Meals */}
						{meals.map((meal) => {
							const acute = calculateAcuteScore(meal.items);
							const statusColor = acute < 35 ? "#2ecc71" : acute < 60 ? "#f1c40f" : "#e74c3c";

							return (
								<IonCard
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
												<CircularProgressbar
													value={acute}
													maxValue={100}
													text={`${acute}`}
													styles={buildStyles({
														textSize: "1.5rem",
														pathColor: statusColor,
														textColor: statusColor,
														trailColor: "#eee",
													})}
												/>
											</div>
											<IonText color='medium'>
												<p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Acute Score</p>
											</IonText>
											<IonText color='medium'>
												<p style={{ fontSize: "0.8rem" }}>{meal.items.reduce((sum, item) => sum + item.kcalPerUnit * item.quantity, 0)} kcal</p>
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
															FII: {item.fii} | kcal: {item.kcalPerUnit * item.quantity}
														</IonLabel>
														<IonLabel color='medium'>
															{item.kcalPerUnit}kcal * {item.quantity}
															{item.unit}
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
							);
						})}
					</>
				)}
			</IonContent>
		</IonPage>
	);
};

export default Dashboard;
