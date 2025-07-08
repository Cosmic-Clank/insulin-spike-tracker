import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText } from "@ionic/react";
import { useParams } from "react-router";
import { usePersistentMealStore } from "../../stores/persistentMealStore";
import PreviewMeal from "./PreviewMeal";

const ExistingMeal = () => {
	const { mealId } = useParams<{ mealId: string }>();
	const { getMealById } = usePersistentMealStore();
	const meal = getMealById(mealId);

	return meal ? (
		<PreviewMeal existingMeal={meal} />
	) : (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>New Meal</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className='ion-padding'>
				<IonText>{mealId} not found</IonText>
			</IonContent>
		</IonPage>
	);
};

export default ExistingMeal;
