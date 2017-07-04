
import {my} from "my-ts";
import { IValidationResult } from "my-ts/build/common/my-common.interface";
import { IObserverWithSubscription } from "../../common/common.interfaces";

export const observerWithSubscriptionValidator =
        (observerWithSubscription: IObserverWithSubscription<any>): IValidationResult => {
        if (my(observerWithSubscription).isNullOrUndefinedOrEmpty) {
            return {isValid: false};
        }
        const observer = observerWithSubscription.observer;
        if (my(observer).isNullOrUndefined) {
            return {isValid: false};
        }
        return {isValid: true};
    };
