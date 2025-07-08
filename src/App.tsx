import { Redirect, Route } from "react-router-dom";
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { addCircle, cog, home } from "ionicons/icons";
import Dashboard from "./pages/dashboard/Dashboard";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.class.css";

/* Theme variables */
import "./theme/variables.css";
import PhotoReview from "./pages/camera/PhotoReview";
import CameraHome from "./pages/camera/CameraHome";
import Settings from "./pages/settings/Settings";
import AddMeal from "./pages/meal/Meals";
import NewMeal from "./pages/meal/NewMeal";
import ExistingMeal from "./pages/meal/ExistingMeal";
import AiMealAdd from "./pages/meal/AiMealAdd";
import PreviewMeal from "./pages/meal/PreviewMeal";

setupIonicReact();

const App: React.FC = () => (
	<IonApp>
		<IonReactRouter>
			<IonTabs>
				<IonRouterOutlet>
					<Route exact path='/dashboard'>
						<Dashboard />
					</Route>
					<Route exact path='/meals'>
						<AddMeal />
					</Route>

					<Route exact path='/meals/current'>
						<PreviewMeal />
					</Route>
					<Route exact path='/meals/existing/:mealId'>
						<ExistingMeal />
					</Route>
					<Route exact path='/meals/new'>
						<NewMeal />
					</Route>
					<Route exact path='/meals/new/ai'>
						<AiMealAdd />
					</Route>

					<Route exact path='/settings'>
						<Settings />
					</Route>

					<Route exact path='/'>
						<Redirect to='/dashboard' />
					</Route>
				</IonRouterOutlet>
				<IonTabBar slot='bottom'>
					<IonTabButton tab='dashboard' href='/dashboard'>
						<IonIcon size='large' aria-hidden='true' icon={home} />
						<IonLabel style={{ fontSize: "10px", marginTop: "4px" }}>Dashboard</IonLabel>
					</IonTabButton>
					<IonTabButton tab='addMeal' href='/meals'>
						<IonIcon size='large' aria-hidden='true' icon={addCircle} />
						<IonLabel style={{ fontSize: "10px", marginTop: "4px" }}>Add Meal</IonLabel>
					</IonTabButton>
					<IonTabButton tab='settings' href='/settings'>
						<IonIcon size='large' aria-hidden='true' icon={cog} />
						<IonLabel style={{ fontSize: "10px", marginTop: "4px" }}>Settings</IonLabel>
					</IonTabButton>
				</IonTabBar>
			</IonTabs>
		</IonReactRouter>
	</IonApp>
);

export default App;
