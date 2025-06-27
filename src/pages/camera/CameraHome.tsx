import { IonPage, IonContent, IonToast, IonHeader, IonToolbar, IonTitle, IonButton, IonImg, IonText, IonIcon } from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useState } from "react";
import { useIonRouter } from "@ionic/react";
import { camera } from "ionicons/icons";

const CameraHome = () => {
	const [error, setError] = useState("");
	const router = useIonRouter();
	// const { View: ScanFoodAnimation } = useLottie({ animationData: scanFood, loop: true, autoplay: true });

	const handleStartScan = async () => {
		try {
			const photo = await Camera.getPhoto({
				resultType: CameraResultType.Base64,
				source: CameraSource.Camera,
				quality: 90,
				saveToGallery: false,
			});

			if (photo.base64String) {
				const base64Image = `data:image/jpeg;base64,${photo.base64String}`;
				router.push(`/camera/review?image=${encodeURIComponent(base64Image)}`, "forward");
			}
		} catch (err) {
			setError("Camera access was cancelled or failed.");
		}
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Smart Camera</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className='ion-padding ion-text-center'>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}>
					{/* {ScanFoodAnimation} */}

					<IonText color='medium'>
						<h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>Scan Your Meal</h2>
						<p style={{ fontSize: "1rem" }}>Snap a photo of your food, and we'll extract FII and kcal info automatically. You can review and edit before saving.</p>
					</IonText>

					<IonButton size='large' onClick={handleStartScan}>
						<IonIcon size='large' icon={camera} slot='icon-only' />
					</IonButton>
				</div>

				<IonToast isOpen={!!error} message={error} duration={2000} color='danger' onDidDismiss={() => setError("")} />
			</IonContent>
		</IonPage>
	);
};

export default CameraHome;
