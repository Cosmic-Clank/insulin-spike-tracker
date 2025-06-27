import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonImg, IonSkeletonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonText, IonInput, IonButtons, IonBackButton, IonButton, useIonRouter, IonToast, IonIcon } from "@ionic/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Meal } from "../../types/Meal";
import { MealItem } from "../../types/MealItem";
import { useMealStore } from "../../stores/mealStore"; // adjust path as needed
import { pencilOutline } from "ionicons/icons";

const fetchMealFromAPI = async (imageUri: string): Promise<Meal> => {
	const res = await fetch("http://localhost:8000/extract-meal", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ image_url: imageUri }),
	});
	if (!res.ok) throw new Error("Failed to extract meal.");
	const data = await res.json();
	return data.meal;
};

const PhotoReview = () => {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const imageDataUri = params.get("image");

	const [meal, setMeal] = useState<Meal | null>(null);
	const [loading, setLoading] = useState(true);
	const [showToast, setShowToast] = useState(false);

	const addMeal = useMealStore((s) => s.addMeal);
	const router = useIonRouter();

	useEffect(() => {
		if (!imageDataUri) return;
		const fetchMeal = async () => {
			const result = await fetchMealFromAPI(imageDataUri);
			setMeal(result);
			setLoading(false);
		};
		fetchMeal();
	}, [imageDataUri]);

	const updateItem = (id: string, field: keyof MealItem, value: string) => {
		if (!meal) return;
		const updatedItems = meal.items.map((item) => (item.id === id ? { ...item, [field]: field === "name" ? value : Number(value) } : item));
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
				{imageDataUri && (
					<IonImg
						src={imageDataUri}
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
									<IonInput type='number' fill='outline' labelPlacement='floating' label='FII' value={item.fii} placeholder='Enter FII' onIonInput={(e) => updateItem(item.id, "fii", e.detail.value!)} />
									<IonInput className='ion-margin-top' labelPlacement='floating' type='number' fill='outline' label='kcals' value={item.kcal} placeholder='Enter kcal' onIonInput={(e) => updateItem(item.id, "kcal", e.detail.value!)} />
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
