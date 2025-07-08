import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFabButton, IonIcon, IonFab, IonItem, IonList, IonLabel, IonThumbnail, IonText, IonImg } from "@ionic/react";
import { add } from "ionicons/icons";
import { calculateAcuteScore, usePersistentMealStore } from "../../stores/persistentMealStore";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import AcuteScoreProgressbar from "../../components/AcuteScoreProgressbar";
import { useCurrentMealStore } from "../../stores/currentMealStore";
import { Meal } from "../../types/Meal";

const AddMeal: React.FC = () => {
	const { meals } = usePersistentMealStore();
	const { resetMeal, meal } = useCurrentMealStore();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Meals</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className='ion-padding'>
				<IonFab slot='fixed' vertical='bottom' horizontal='end'>
					<IonFabButton onClick={resetMeal} routerLink='/meals/new'>
						<IonIcon icon={add}></IonIcon>
					</IonFabButton>
				</IonFab>
				{meal.name !== "New Meal" && (
					<>
						<IonText color='medium'>
							<h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Current Meal</h2>
						</IonText>
						<MealCard key={meal.id} meal={meal} />
					</>
				)}
				<IonText color='medium'>
					<h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Recent Meals</h2>
				</IonText>
				{meals.map((meal) => (
					<MealCard key={meal.id} meal={meal} />
				))}
			</IonContent>
		</IonPage>
	);
};

export default AddMeal;

function MealCard({ meal }: { meal: Meal }) {
	return (
		<IonItem lines='none' className='ion-margin-vertical' routerLink={`/meals/existing/${meal.id}`}>
			<IonThumbnail slot='end' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
				<AcuteScoreProgressbar mealItems={meal.items} style={{ width: "100%", height: "100%", margin: "0 auto" }} />
			</IonThumbnail>
			{meal.image && (
				<IonThumbnail slot='start' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
					<IonImg src={meal.image ?? ""} alt='Meal Image' style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
				</IonThumbnail>
			)}

			<IonLabel>
				<h2>{meal.name}</h2>
				<p>{new Date(meal.timestamp).toLocaleString()}</p>
				<p>{meal.items.reduce((total, item) => total + item.kcalPerUnit * item.quantity, 0)} kcal</p>
			</IonLabel>
		</IonItem>
	);
}
