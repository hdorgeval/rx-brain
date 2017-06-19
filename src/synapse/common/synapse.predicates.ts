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
export const observerWithActiveSubcription =
        (observer: IObserverWithSubscription<any>): boolean => {
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

export const observerWithNoActiveSubscription =
        (observer: IObserverWithSubscription<any>): boolean => {
                if (my(observer).isNullOrUndefinedOrEmpty) {
                    return false;
                }
                if (my(observer.observer).isNullOrUndefined) {
                    return false;
                }
                if (my(observer.subscription).isNullOrUndefined) {
                    return true;
                }
                if (observer.subscription.closed) {
                    return true;
                }
                return false;
        };
