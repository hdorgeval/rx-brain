import {my} from "my-ts";
import { IObserverWithSubscription } from "./synapse.interface";

export const observerHasActiveSubcription =
        (observer: IObserverWithSubscription<any>, index: number): boolean => {
                if (my(observer).isNullOrUndefinedOrEmpty) {
                    return false;
                }
                if (my(observer.subscription).isNullOrUndefined) {
                    return false;
                }
                if (observer.subscription.closed) {
                    return false;
                }
                return true;
        };
