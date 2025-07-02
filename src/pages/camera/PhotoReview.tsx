import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonImg, IonSkeletonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonInput, IonButtons, IonBackButton, IonButton, useIonRouter, IonToast, IonIcon, IonSelect, IonSelectOption } from "@ionic/react";
import { useEffect, useState } from "react";
import { Meal } from "../../types/Meal";
import { MealItem, Unit } from "../../types/MealItem";
import { useMealStore } from "../../stores/mealStore"; // adjust path as needed
import { pencilOutline } from "ionicons/icons";
import { useExtractMealDataStore } from "../../stores/extractMealDataStore";

const fetchMealFromAPI = async (base64Images: string[], textualData: string): Promise<Meal> => {
	const res = await fetch("http://localhost:8000/extract-meal", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ images: base64Images, textualData }),
	});
	if (!res.ok) throw new Error("Failed to extract meal.");
	const data = await res.json();
	return data.meal;
};

const PhotoReview = () => {
	const [meal, setMeal] = useState<Meal | null>(null);
	const [loading, setLoading] = useState(true);
	const [showToast, setShowToast] = useState(false);

	const addMeal = useMealStore((s) => s.addMeal);
	const router = useIonRouter();

	const { images, textualData } = useExtractMealDataStore();

	useEffect(() => {
		if (!images || images.length === 0) return;
		const fetchMeal = async () => {
			const result = await fetchMealFromAPI(images, textualData);
			setMeal(result);
			setLoading(false);
		};
		fetchMeal();
	}, []);

	const updateItem = (id: string, field: keyof MealItem, value: string) => {
		if (!meal) return;
		const updatedItems = meal.items.map((item) => (item.id === id ? { ...item, [field]: field === "name" || "unit" ? value : Number(value) } : item));
		setMeal({ ...meal, items: updatedItems });
	};

	const handleLogMeal = () => {
		if (!meal) return;
		addMeal(meal); // ✅ Adds full meal to Zustand
		setShowToast(true);
		setTimeout(() => {
			router.goBack(); // or wherever you want
		}, 800);
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/camera' />
					</IonButtons>
					<IonTitle>Review Meal</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className=''>
				{images && (
					<IonImg
						src={images[0]}
						alt='Captured food'
						style={{
							width: "100%",
							height: "200px",
							objectFit: "cover",
							borderRadius: "16px",
							marginBottom: "1rem",
						}}
					/>
				)}

				{loading ? (
					<>
						<IonCard className='ion-margin-bottom'>
							<IonCardHeader>
								<IonCardTitle>
									<IonSkeletonText animated style={{ height: "20px", width: "50%", borderRadius: 2000 }} />
								</IonCardTitle>
								<IonText color='medium'>
									<IonSkeletonText animated style={{ width: "20%", borderRadius: 2000 }} />
									<IonSkeletonText animated style={{ width: "30%", borderRadius: 2000 }} />
								</IonText>
							</IonCardHeader>
						</IonCard>
						<IonCard className='ion-margin-bottom'>
							<IonCardHeader>
								<IonCardTitle>
									<IonSkeletonText animated style={{ height: "20px", width: "30%", borderRadius: 2000 }} />
								</IonCardTitle>
							</IonCardHeader>
							<IonCardContent>
								<IonSkeletonText className='ion-margin-bottom' animated style={{ height: "40px", width: "100%" }} />
								<IonSkeletonText animated style={{ height: "40px", width: "100%" }} />
							</IonCardContent>
						</IonCard>
						<IonCard className='ion-margin-bottom'>
							<IonCardHeader>
								<IonCardTitle>
									<IonSkeletonText animated style={{ height: "20px", width: "30%", borderRadius: 2000 }} />
								</IonCardTitle>
							</IonCardHeader>
							<IonCardContent>
								<IonSkeletonText className='ion-margin-bottom' animated style={{ height: "40px", width: "100%" }} />
								<IonSkeletonText animated style={{ height: "40px", width: "100%" }} />
							</IonCardContent>
						</IonCard>
						<IonCard className='ion-margin-bottom'>
							<IonCardHeader>
								<IonCardTitle>
									<IonSkeletonText animated style={{ height: "20px", width: "30%", borderRadius: 2000 }} />
								</IonCardTitle>
							</IonCardHeader>
							<IonCardContent>
								<IonSkeletonText className='ion-margin-bottom' animated style={{ height: "40px", width: "100%" }} />
								<IonSkeletonText animated style={{ height: "40px", width: "100%" }} />
							</IonCardContent>
						</IonCard>
					</>
				) : meal ? (
					<>
						<IonCard className='ion-margin-bottom'>
							<IonCardHeader>
								<IonCardTitle>{meal.name}</IonCardTitle>
								<IonText color='medium'>
									<p style={{ marginTop: "4px" }}>
										Total Items: {meal.items.length} <br />
										Logged at: {new Date(meal.timestamp).toLocaleTimeString()}
									</p>
								</IonText>
							</IonCardHeader>
						</IonCard>

						{meal.items.map((item) => (
							<IonCard key={item.id} className='ion-margin-bottom'>
								<IonCardHeader>
									<IonCardTitle>{item.name}</IonCardTitle>
								</IonCardHeader>
								<IonCardContent>
									<IonInput type='number' fill='outline' labelPlacement='start' label='FII' value={item.fii} placeholder='Enter FII' onIonInput={(e) => updateItem(item.id, "fii", e.detail.value!)} />
									<IonSelect className='ion-margin-top' label='Unit' fill='outline' value={item.unit} onIonChange={(e) => updateItem(item.id, "unit", e.detail.value)}>
										{Object.values(Unit).map((u) => (
											<IonSelectOption key={u} value={u}>
												{u}
											</IonSelectOption>
										))}
									</IonSelect>
									<IonInput className='ion-margin-top' labelPlacement='start' type='number' fill='outline' label={`kcals per (${item.unit})`} value={item.kcalPerUnit} placeholder='Enter kcal for one unit' onIonInput={(e) => updateItem(item.id, "kcalPerUnit", e.detail.value!)} />
									<IonInput className='ion-margin-vertical' labelPlacement='start' type='number' fill='outline' label='Quantity' value={item.quantity} placeholder={`Enter quantity (${item.unit})`} onIonInput={(e) => updateItem(item.id, "quantity", e.detail.value!)} />
									<IonText>Total Calories: {item.kcalPerUnit && item.quantity ? (Number(item.kcalPerUnit) * Number(item.quantity)).toFixed(0) : 0} kcal</IonText>
								</IonCardContent>
							</IonCard>
						))}

						<IonCard className='ion-no-margin'>
							<IonCardContent className='ion-text-center'>
								<IonButton shape='round' color='primary' onClick={handleLogMeal}>
									<IonIcon slot='end' icon={pencilOutline} size='small' />
									Log Meal
								</IonButton>
							</IonCardContent>
						</IonCard>
						<IonToast isOpen={showToast} message='Meal logged successfully' duration={1200} color='success' onDidDismiss={() => setShowToast(false)} />
					</>
				) : (
					<IonText color='danger'>Failed to load meal data.</IonText>
				)}
			</IonContent>
		</IonPage>
	);
};

export default PhotoReview;
