import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonImg, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonInput, IonButtons, IonBackButton, IonButton, useIonRouter, IonToast, IonIcon, IonSelect, IonSelectOption, IonFab, IonFabButton, IonActionSheet, IonAlert, IonThumbnail, IonModal, IonItem, IonLabel, IonItemDivider, IonList, IonNote, IonFabList } from "@ionic/react";
import { useState } from "react";

import { MealItem, Unit } from "../../types/MealItem";
import { usePersistentMealStore } from "../../stores/persistentMealStore"; // adjust path as needed
import { add, arrowBack, barcode, batteryCharging, camera, chevronBack, chevronForward, chevronUp, close, create, desktop, ellipsisVertical, flame, information, pencil, pizza, save, saveSharp, trash } from "ionicons/icons";
import { useCurrentMealStore } from "../../stores/currentMealStore";
import LoadingPreview from "./LoadingPreviewComponent";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { fetchBarcodeMealItemFromAPI } from "../../api/api";
import { calculateTotalCalories, getMealTimeString } from "../../utils";
import { NutrimentComponent } from "../../components/NutrimentComponent";

const PreviewMeal = () => {
	const { meal, setMeal, deleteMealItem, addEmptyMealItem, setImage, setName, resetMeal, addMealItem } = useCurrentMealStore();

	const [loading, setLoading] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");

	const { addMeal, deleteMeal } = usePersistentMealStore();
	const router = useIonRouter();

	const [modalItem, setModalItem] = useState<MealItem | null>(null);

	const updateItem = (id: string, field: keyof MealItem, value: string) => {
		if (!meal) return;
		const updatedItems = meal.items.map((item) => (item.id === id ? { ...item, [field]: field === "name" || field === "servingUnit" ? value : Number(value) } : item));
		setMeal({ ...meal, items: updatedItems });
		// Update modalItem if it's open and matches the updated item
		setModalItem((prev) => (prev && prev.id === id ? { ...prev, [field]: field === "name" || field === "servingUnit" ? value : Number(value) } : prev));
	};

	const handleLogMeal = () => {
		if (!meal) return;
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

	const scanBarcodeAndAddItem = async () => {
		try {
			const photo = await Camera.getPhoto({
				resultType: CameraResultType.Base64,
				source: CameraSource.Camera,
				quality: 90,
				saveToGallery: false,
			});

			setLoading(true);

			if (photo.base64String) {
				const base64Image = `data:image/jpeg;base64,${photo.base64String}`;
				// Call your API to decode the barcode and add the item
				const barcodeMealItem = await fetchBarcodeMealItemFromAPI(base64Image);
				addMealItem(barcodeMealItem);
				setLoading(false);
				setToastMessage("Item added successfully");
			}
		} catch (err: unknown) {
			if (typeof err === "object" && err !== null && "message" in err) {
				setToastMessage(typeof err.message === "string" && err.message ? err.message : "Failed to scan barcode.");
				setLoading(false);
			} else {
				setToastMessage("Camera access was cancelled or failed.");
				setLoading(false);
			}
		}
		setShowToast(true);
	};

	const handleCopyFirstMealItemToMealData = () => {
		if (!meal || meal.items.length === 0) return;

		const firstItem = meal.items[0];
		setImage(firstItem.image || "");
		setName(firstItem.name || "");
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/meals' />
					</IonButtons>

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
						<IonCard style={{ borderRadius: "16px" }}>
							<IonCardHeader>
								<IonCardTitle>
									<IonInput
										value={meal.name}
										placeholder='Enter item name'
										onIonInput={(e) => setMeal({ ...meal, name: e.detail.value! })}
										style={{
											color: "white",
											fontSize: "20px",
										}}>
										<IonIcon slot='end' icon={create} aria-hidden='true'></IonIcon>
									</IonInput>
								</IonCardTitle>
								<IonText color='medium'>
									<p style={{ marginTop: "4px" }}>
										Total Items: {meal.items.length} <br />
										Total Calories: {calculateTotalCalories(meal)} kcal <br />
										Logged at: {getMealTimeString(meal)}
									</p>
								</IonText>
								{meal.items.length !== 0 && (
									<IonButton size='small' onClick={handleCopyFirstMealItemToMealData}>
										Update Data Using First Item
									</IonButton>
								)}
							</IonCardHeader>
						</IonCard>

						<IonModal isOpen={!!modalItem} onDidDismiss={() => setModalItem(null)} className=''>
							<IonHeader>
								<IonToolbar>
									<IonTitle>Edit: {modalItem?.name}</IonTitle>
									<IonButtons slot='start'>
										<IonButton slot='icon-only' size='large' onClick={() => setModalItem(null)}>
											<IonIcon slot='icon-only' icon={arrowBack} />
										</IonButton>
									</IonButtons>
								</IonToolbar>
							</IonHeader>
							<IonContent className='ion-padding'>
								{modalItem && (
									<IonCard>
										<IonCardHeader style={{ display: "flex", flexDirection: "row", gap: "12px", justifyContent: "space-between" }}>
											<IonInput
												value={modalItem.name}
												placeholder='Enter item name'
												onIonInput={(e) => updateItem(modalItem.id, "name", e.detail.value!)}
												style={{
													color: "white",
													fontSize: "20px",
												}}>
												<IonIcon slot='end' icon={create} aria-hidden='true'></IonIcon>
											</IonInput>
											{modalItem.image ? (
												<IonThumbnail>
													<img alt='Silhouette of mountains' src={modalItem.image} />
												</IonThumbnail>
											) : null}
										</IonCardHeader>
										<IonCardContent>
											<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Serving Size' value={modalItem.servingSize} placeholder={`Enter Serving Size`} onIonInput={(e) => updateItem(modalItem.id, "servingSize", e.detail.value!)} />
											<IonSelect className='ion-margin-top' label='Serving Unit' fill='outline' value={modalItem.servingUnit} onIonChange={(e) => updateItem(modalItem.id, "servingUnit", e.detail.value)}>
												{Object.values(Unit).map((u) => (
													<IonSelectOption key={u} value={u}>
														{u}
													</IonSelectOption>
												))}
											</IonSelect>
											<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Amount' value={modalItem.amount} placeholder={`Enter Amount`} onIonInput={(e) => updateItem(modalItem.id, "amount", e.detail.value!)} />
											<IonInput className='ion-margin-top' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label={`kcals per serving`} value={modalItem.kcalPerServing} placeholder='Enter kcal for one serving' onIonInput={(e) => updateItem(modalItem.id, "kcalPerServing", e.detail.value!)} />
											<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Carb per serving (g)' value={modalItem.carbPerServing_g} placeholder={`Enter carbs per serving (g)`} onIonInput={(e) => updateItem(modalItem.id, "carbPerServing_g", e.detail.value!)} />
											<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Saturated Fat per serving (g)' value={modalItem.satFatPerServing_g} placeholder={`Enter saturated fat per serving (g)`} onIonInput={(e) => updateItem(modalItem.id, "satFatPerServing_g", e.detail.value!)} />
											<IonInput fill='outline' labelPlacement='start' type='number' style={{ textAlign: "right" }} label='FII' value={modalItem.fii} placeholder='Enter FII' onIonInput={(e) => updateItem(modalItem.id, "fii", e.detail.value!)} />
											<IonInput className='ion-margin-vertical' labelPlacement='start' style={{ textAlign: "right" }} type='number' fill='outline' label='Glycemic Index' value={modalItem.gi} placeholder={`Enter glycemic index`} onIonInput={(e) => updateItem(modalItem.id, "gi", e.detail.value!)} />
											<div className='' style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
												<NutrimentComponent nutrimentName='Total Calories' nutrimentValue={`${modalItem.kcalPerServing && modalItem.amount ? (Number(modalItem.kcalPerServing) * Number(modalItem.amount)).toFixed(2) : 0} kcal`} nutrimentIcon={flame} nutrimentIconColor='#ff5151ff' />
												<NutrimentComponent nutrimentName='Total Carbs' nutrimentValue={`${modalItem.carbPerServing_g && modalItem.amount ? (Number(modalItem.carbPerServing_g) * Number(modalItem.amount)).toFixed(2) : 0} g`} nutrimentIcon={pizza} nutrimentIconColor='#ffcc00ff' />
												<NutrimentComponent nutrimentName='Total Saturated Fat' nutrimentValue={`${modalItem.satFatPerServing_g && modalItem.amount ? (Number(modalItem.satFatPerServing_g) * Number(modalItem.amount)).toFixed(2) : 0} g`} nutrimentIcon={batteryCharging} nutrimentIconColor='#0091ffff' />
												{modalItem.source ? <IonText>Source: {modalItem.source}</IonText> : null}

												<IonButton onClick={() => setModalItem(null)}>
													<IonIcon slot='icon-only' icon={save} />
												</IonButton>

												<IonButton
													slot='icon-only'
													color='danger'
													onClick={() => {
														deleteMealItem(modalItem.id);
														setModalItem(null);
													}}>
													<IonIcon slot='icon-only' icon={trash} />
												</IonButton>
											</div>
										</IonCardContent>
									</IonCard>
								)}
							</IonContent>
						</IonModal>

						<IonItemDivider>
							<IonLabel>Meal Items</IonLabel>
						</IonItemDivider>

						{meal.items.length === 0 ? (
							<IonItem lines='none' className='ion-text-center ion-padding'>
								<IonText color='medium'>Start by adding a meal item by clicking the "+" button</IonText>
							</IonItem>
						) : (
							<IonList inset={true} style={{ borderRadius: "16px" }}>
								{meal.items.map((item) => (
									<IonItem button key={item.id} onClick={() => setModalItem(item)}>
										{item.image ? (
											<IonThumbnail slot='end'>
												<IonImg alt='Silhouette of mountains' src={item.image} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
											</IonThumbnail>
										) : null}
										<IonLabel>
											<h2 style={{ marginBottom: "0.5rem" }}>{item.name}</h2>
											<IonNote color='medium' className='ion-text-wrap'>
												<NutrimentComponent nutrimentName='Calories' nutrimentValue={item.kcalPerServing * item.amount} nutrimentIcon={flame} nutrimentIconColor='#ff5151ff' />
												<NutrimentComponent nutrimentName='Carbohydrates' nutrimentValue={item.carbPerServing_g * item.amount} nutrimentIcon={pizza} nutrimentIconColor='#ffcc00ff' />
												<NutrimentComponent nutrimentName='Saturated Fats' nutrimentValue={item.satFatPerServing_g * item.amount} nutrimentIcon={batteryCharging} nutrimentIconColor='#0091ffff' />
												<NutrimentComponent nutrimentName='FII' nutrimentValue={item.fii * item.amount} nutrimentIcon={information} nutrimentIconColor='green' />
												<NutrimentComponent nutrimentName='GI' nutrimentValue={item.gi * item.amount} nutrimentIcon={information} nutrimentIconColor='green' />
											</IonNote>
										</IonLabel>
										<IonIcon slot='end' icon={chevronForward} />
									</IonItem>
								))}
							</IonList>
						)}

						<div className='ion-text-center ion-margin-vertical'>
							<IonButton id='open-meal-item-action-sheet' size='large' shape='round' color='primary'>
								<IonIcon slot='icon-only' icon={add} size='small' />
							</IonButton>
						</div>

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
										action: "barcode",
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
								if (!detail.data || detail.data.action === "cancel") return;
								if (detail.data.action === "ai") {
									router.push("/meals/new/ai");
								} else if (detail.data.action === "manual") {
									addEmptyMealItem();
								} else if (detail.data.action === "barcode") {
									scanBarcodeAndAddItem();
								}
							}}
						/>

						<IonFab slot='fixed' vertical='bottom' horizontal='end'>
							<IonFabButton>
								<IonIcon size='small' icon={chevronUp}></IonIcon>
							</IonFabButton>
							<IonFabList side='top'>
								<IonFabButton
									color='danger'
									onClick={() => {
										deleteMeal(meal.id);
										resetMeal(); // Reset the current meal state
										setTimeout(() => {
											router.goBack();
										}, 100);
									}}>
									<IonIcon icon={trash}></IonIcon>
								</IonFabButton>
								<IonFabButton color='success' id='log-meal-alert'>
									<IonIcon icon={save}></IonIcon>
								</IonFabButton>
							</IonFabList>
						</IonFab>

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

						<IonToast isOpen={showToast} message={toastMessage} duration={2200} color='success' onDidDismiss={() => setShowToast(false)} />
					</>
				)}
			</IonContent>
		</IonPage>
	);
};

export default PreviewMeal;
