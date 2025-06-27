import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonToggle, IonText } from "@ionic/react";
import React, { useEffect } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

const Settings: React.FC = () => {
	const darkMode = useSettingsStore((s) => s.darkMode);
	const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Settings</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className='ion-padding'>
				<IonText color='medium'>
					<h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Preferences</h2>
				</IonText>

				<IonList>
					<IonItem style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<IonToggle checked={darkMode} onIonChange={(e) => toggleDarkMode(e.detail.checked)}>
							Dark Mode
						</IonToggle>
					</IonItem>
				</IonList>
			</IonContent>
		</IonPage>
	);
};

export default Settings;
