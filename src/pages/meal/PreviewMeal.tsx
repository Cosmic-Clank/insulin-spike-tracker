import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonImg, IonSkeletonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonInput, IonButtons, IonBackButton, IonButton, useIonRouter, IonToast, IonIcon, IonSelect, IonSelectOption, IonCardSubtitle, IonFab, IonFabButton, IonFabList, IonActionSheet, IonAlert } from "@ionic/react";
import { useEffect, useState } from "react";
import { Meal } from "../../types/Meal";
import { MealItem, Unit } from "../../types/MealItem";
import { usePersistentMealStore } from "../../stores/persistentMealStore"; // adjust path as needed
import { add, addCircle, barcode, camera, close, cloud, desktop, ellipse, ellipsisHorizontal, ellipsisVertical, pencil, pencilOutline, trash } from "ionicons/icons";
import { useCurrentMealStore } from "../../stores/currentMealStore";
import LoadingPreview from "./LoadingPreviewComponent";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const PreviewMeal = ({ existingMeal }: { existingMeal?: Meal }) => {
	const { meal, setMeal, deleteMealItem, addEmptyMealItem, setImage, setNewMealId } = useCurrentMealStore();
	useEffect(() => {
		if (existingMeal) {
			setMeal(existingMeal);
		}
	}, [existingMeal, setMeal]);

	const [loading, setLoading] = useState(false);
	const [showToast, setShowToast] = useState(false);

	const { addMeal, deleteMeal } = usePersistentMealStore();
	const router = useIonRouter();

	const updateItem = (id: string, field: keyof MealItem, value: string) => {
		if (!meal) return;
		const updatedItems = meal.items.map((item) => (item.id === id ? { ...item, [field]: field === "name" || "unit" ? value : Number(value) } : item));
		setMeal({ ...meal, items: updatedItems });
	};

	const handleLogMeal = () => {
		if (!meal) return;
		setNewMealId(); // Generate a new ID for the meal
		addMeal(meal); // ✅ Adds full meal to Zustand
		setShowToast(true);
		setTimeout(() => {
			router.goBack(); // or wherever you want
		}, 800);
	};

	const handleTakePicture = async () => {
		try {
			const photo = await Camera.getPhoto({
				resultType: CameraResultType.Base64,
				source: CameraSource.Camera,
				quality: 90,
				saveToGallery: false,
			});

			if (photo.base64String) {
				const base64Image = `data:image/jpeg;base64,${photo.base64String}`;
				setImage(base64Image); // Update meal with captured image

				// router.push(`/camera/review?image=${encodeURIComponent(base64Image)}`, "forward");
			}
		} catch (err) {
			console.log("Camera access was cancelled or failed.");
		}
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/meals' />
					</IonButtons>
					<IonButton id='open-meal-action-sheet' slot='end' fill='clear' color='dark'>
						<IonIcon icon={ellipsisVertical} />
					</IonButton>
					<IonTitle>Review Meal</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className=''>
				{meal.image ? (
					<IonImg
						src={meal.image}
						alt='Captured food'
						style={{
							width: "100%",
							height: "200px",
							objectFit: "cover",
							borderRadius: "16px",
							marginBottom: "1rem",
						}}
					/>
				) : (
					<IonButton expand='block' color='medium' fill='outline' onClick={handleTakePicture} className='ion-margin-bottom'>
						<IonIcon icon={camera} slot='start' />
						Take Picture
					</IonButton>
				)}

				{loading ? (
					<LoadingPreview />
				) : (
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
									<IonInput fill='outline' labelPlacement='start' type='number' style={{ textAlign: "right" }} label='FII' value={item.fii} placeholder='Enter FII' onIonInput={(e) => updateItem(item.id, "fii", e.detail.value!)} />
									<IonSelect className='ion-margin-top' label='Unit' fill='outline' value={item.unit} onIonChange={(e) => updateItem(item.id, "unit", e.detail.value)}>
										{Object.values(Unit).map((u) => (
											<IonSelectOption key={u} value={u}>
												{u}
											</IonSelectOption>
										))}
									</IonSelect>
									<IonInput className='ion-margin-top' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label={`kcals per (${item.unit})`} value={item.kcalPerUnit} placeholder='Enter kcal for one unit' onIonInput={(e) => updateItem(item.id, "kcalPerUnit", e.detail.value!)} />
									<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Quantity' value={item.quantity} placeholder={`Enter quantity (${item.unit})`} onIonInput={(e) => updateItem(item.id, "quantity", e.detail.value!)} />
									<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Carb (g)' value={item.carb_g} placeholder={`Enter carbs (g)`} onIonInput={(e) => updateItem(item.id, "carb_g", e.detail.value!)} />
									<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Glycemic Index' value={item.gi} placeholder={`Enter glycemic index`} onIonInput={(e) => updateItem(item.id, "gi", e.detail.value!)} />
									<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Saturated Fat (g)' value={item.gi} placeholder={`Enter saturated fat (g)`} onIonInput={(e) => updateItem(item.id, "satFat_g", e.detail.value!)} />
									<div className='' style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<IonText>Total Calories: {item.kcalPerUnit && item.quantity ? (Number(item.kcalPerUnit) * Number(item.quantity)).toFixed(0) : 0} kcal</IonText>
										<IonButton slot='icon-only' color='danger' onClick={() => deleteMealItem(item.id)}>
											<IonIcon slot='icon-only' icon={trash} />
										</IonButton>
									</div>
								</IonCardContent>
							</IonCard>
						))}

						<div className='ion-text-center ion-margin-vertical'>
							<IonButton id='open-meal-item-action-sheet' size='large' shape='round' color='primary'>
								<IonIcon slot='icon-only' icon={add} size='small' />
							</IonButton>
						</div>

						<IonActionSheet
							trigger='open-meal-action-sheet'
							header='Actions'
							buttons={[
								{
									text: "Delete Meal",
									role: "destructive",
									icon: trash,
									data: {
										action: "delete",
									},
								},
								{
									text: "Cancel",
									role: "cancel",
									icon: close,
									data: {
										action: "cancel",
									},
								},
							]}
							onDidDismiss={({ detail }) => {
								if (detail.data.action === "delete") {
									deleteMeal(meal.id);
									setTimeout(() => {
										router.push("/meals", "root");
									}, 100); // slight delay to ensure state updates
								}
							}}
						/>

						<IonActionSheet
							trigger='open-meal-item-action-sheet'
							header='Actions'
							buttons={[
								{
									text: "AI",
									icon: desktop,
									data: {
										action: "ai",
									},
								},
								{
									text: "Manual",
									icon: pencil,
									data: {
										action: "manual",
									},
								},
								{
									text: "Barcode",
									icon: barcode,
									data: {
										action: "manual",
									},
								},
								{
									text: "Database",
									icon: cloud,
									data: {
										action: "database",
									},
								},
								{
									text: "Cancel",
									role: "cancel",
									icon: close,
									data: {
										action: "cancel",
									},
								},
							]}
							onDidDismiss={({ detail }) => {
								if (detail.data.action === "ai") {
									router.push("/meals/new/ai");
								} else if (detail.data.action === "manual") {
									addEmptyMealItem();
								}
							}}
						/>

						<IonCard className='ion-no-margin'>
							<IonCardContent className='ion-text-center'>
								<IonButton expand='block' shape='round' color='primary' id='log-meal-alert'>
									<IonIcon slot='end' icon={pencilOutline} size='small' />
									Log Meal
								</IonButton>
							</IonCardContent>
						</IonCard>

						<IonAlert
							header='Warning'
							message='Please make sure the fields are sensible. If you used AI, you might want to double-check the values.'
							trigger='log-meal-alert'
							buttons={[
								{
									text: "Back",
									role: "cancel",
								},
								{
									text: "Continue",
									role: "confirm",
									handler: handleLogMeal,
								},
							]}></IonAlert>

						<IonToast isOpen={showToast} message='Meal logged successfully' duration={1200} color='success' onDidDismiss={() => setShowToast(false)} />
					</>
				)}
			</IonContent>
		</IonPage>
	);
};

export default PreviewMeal;
