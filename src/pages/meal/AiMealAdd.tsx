import { IonPage, IonContent, IonToast, IonHeader, IonToolbar, IonTitle, IonButton, IonImg, IonText, IonIcon, IonTextarea, IonBackButton, IonButtons, IonFab, IonFabButton, IonLoading } from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useState } from "react";
import { useIonRouter } from "@ionic/react";
import { arrowForward, camera, trash } from "ionicons/icons";
import { fetchAiMealFromAPI } from "../../api/api";
import { useCurrentMealStore } from "../../stores/currentMealStore";

const AiMealAdd = () => {
	const [error, setError] = useState("");
	const router = useIonRouter();
	const [images, setImages] = useState<string[]>([]);
	const addImage = (image: string) => {
		setImages((prev) => [...prev, image]);
	};
	const removeImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	};
	const [textualData, setTextualData] = useState("");
	// const { View: ScanFoodAnimation } = useLottie({ animationData: scanFood, loop: true, autoplay: true });
	const { addMealItem, setImage, setName } = useCurrentMealStore();
	const [isLoading, setLoading] = useState(false);

	const handleOnSubmit = async () => {
		if (images.length === 0) {
			setError("Please capture at least one image before proceeding.");
			return;
		}
		setLoading(true);
		try {
			const meal = await fetchAiMealFromAPI(images, textualData);
			meal.items.forEach((item) => {
				addMealItem(item);
			});
			// Optionally, you can set the meal image or other properties here
			setLoading(false);
			router.goBack();
		} catch (error) {
			setLoading(false);
		}
	};

	const handleStartScan = async () => {
		try {
			const photo = await Camera.getPhoto({
				resultType: CameraResultType.Base64,
				source: CameraSource.Camera,
				quality: 90,
				saveToGallery: false,
			});

			if (photo.base64String) {
				if (images.length >= 5) {
					setError("You can only upload up to 5 images.");
					return;
				}
				const base64Image = `data:image/jpeg;base64,${photo.base64String}`;
				addImage(base64Image);

				// router.push(`/camera/review?image=${encodeURIComponent(base64Image)}`, "forward");
			}
		} catch (err) {
			setError("Camera access was cancelled or failed.");
		}
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton />
					</IonButtons>
					<IonTitle>Smart Camera</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className='ion-padding ion-text-center'>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
					{/* {ScanFoodAnimation} */}

					<IonText color='medium'>
						<h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "2rem" }}>Scan Your Meal</h2>
						<ul style={{ textAlign: "left", paddingLeft: "1.5rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
							<li style={{ fontSize: "1rem", marginBottom: "0.3rem" }}>Snap pictures of your meal.</li>
							<li style={{ fontSize: "1rem", marginBottom: "0.3rem" }}>Include as many pictures as you like (up to 5).</li>
							<li style={{ fontSize: "1rem", marginBottom: "0.3rem" }}>Include images of the nutritional info, serving size, and other data.</li>
							<li style={{ fontSize: "1rem" }}>Providing more data provides more accurate results.</li>
							<li style={{ fontSize: "1rem" }}>Optionally provide more textual description to better describe your meal.</li>
						</ul>
					</IonText>

					{images && (
						<div className='ion-margin-vertical' style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
							{images.map((imageDataUri, index) => (
								<div className='' style={{ position: "relative" }} key={index}>
									<IonImg
										key={index}
										src={imageDataUri}
										alt={`Captured food ${index + 1}`}
										style={{
											width: 120,
											height: 120,
											objectFit: "cover",
											borderRadius: 10,
											overflow: "hidden",
										}}
									/>
									<IonButton
										color='danger'
										size='small'
										onClick={() => {
											removeImage(index);
										}}
										style={{ position: "absolute", top: -10, right: -10 }}>
										<IonIcon icon={trash} slot='icon-only' />
									</IonButton>
								</div>
							))}
						</div>
					)}

					<IonTextarea onIonChange={(e) => setTextualData(e.detail.value ?? "")} value={textualData} className='ion-text-left' fill='outline' label='Textual Description (Optional)' labelPlacement='floating' placeholder='Textual Description'></IonTextarea>

					<IonButton className='ion-margin-top' size='large' onClick={handleStartScan}>
						<IonIcon size='large' icon={camera} slot='icon-only' />
					</IonButton>
				</div>

				<IonFab slot='fixed' vertical='bottom' horizontal='end'>
					<IonFabButton onClick={handleOnSubmit} disabled={isLoading || images.length === 0}>
						<IonIcon icon={arrowForward}></IonIcon>
					</IonFabButton>
				</IonFab>
				<IonLoading message='Loading' isOpen={isLoading} />
				<IonToast isOpen={!!error} message={error} duration={3000} color='danger' onDidDismiss={() => setError("")} />
			</IonContent>
		</IonPage>
	);
};

export default AiMealAdd;
