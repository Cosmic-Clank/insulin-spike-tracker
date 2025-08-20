import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFabButton, IonIcon, IonFab, IonItem, IonLabel, IonThumbnail, IonText, IonImg, useIonRouter } from "@ionic/react";
import { add } from "ionicons/icons";
import { usePersistentMealStore } from "../../stores/persistentMealStore";
import AcuteScoreProgressbar from "../../components/AcuteScoreProgressbar";
import { useCurrentMealStore } from "../../stores/currentMealStore";
import { Meal } from "../../types/Meal";
import { calculateTotalCalories, getMealTimeString } from "../../utils";

const AddMeal: React.FC = () => {
	const { meals } = usePersistentMealStore();
	const { resetMeal, meal } = useCurrentMealStore();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar className='ion-padding-top ion-text-center'>
					<IonTitle>Meals</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className='ion-padding'>
				<IonFab slot='fixed' vertical='bottom' horizontal='end'>
					<IonFabButton onClick={resetMeal} routerLink='/meals/new'>
						<IonIcon icon={add}></IonIcon>
					</IonFabButton>
				</IonFab>
				{/* {meal.name !== "New Meal" && (
					<>
						<IonText color='medium'>
							<h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Current Meal</h2>
						</IonText>
						<MealCard key={meal.id} meal={meal} />
					</>
				)} */}
				<IonText color='medium'>
					<h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Re-add Previous Meals</h2>
				</IonText>
				{meals.map((meal, index) => (
					<MealCard key={index} meal={meal} />
				))}
			</IonContent>
		</IonPage>
	);
};

export default AddMeal;

function MealCard({ meal }: { meal: Meal }) {
	const { getMealById } = usePersistentMealStore();
	const { setMeal, setNewMealId } = useCurrentMealStore();

	function handleClick(mealId: string) {
		// Navigate to existing meal details
		const meal = getMealById(mealId);
		if (!meal) {
			return;
		}
		setMeal(meal);
		setNewMealId();
	}

	return (
		<IonItem lines='none' className='ion-margin-vertical' style={{ borderRadius: "8px" }} onClick={() => handleClick(meal.id)} routerLink='/meals/new'>
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
				<p>{getMealTimeString(meal)}</p>
				<p>{calculateTotalCalories(meal)} kcal </p>
			</IonLabel>
		</IonItem>
	);
}
