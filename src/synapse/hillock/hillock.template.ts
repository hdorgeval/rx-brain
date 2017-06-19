import {my} from "my-ts";
import * as rx from "rxjs";
import {IObserverWithSubscription} from "../common/synapse.interface";
import { observerWithActiveSubcription, observerWithNoActiveSubscription } from "../common/synapse.predicates";
import { observerWithSubscriptionValidator } from "../common/synapse.validators";
import {IInputChannel} from "./hillock.interface";
export class Hillock<T> implements IInputChannel<T> {
    private source: rx.Observable<T>;
    private observerWithSubscription: IObserverWithSubscription<T>;
    private get hasObserver() {
        const observerWithSubscription = this.observerWithSubscription;
        const {isValid} = my(observerWithSubscription)
                            .validateWith(observerWithSubscriptionValidator);
        return isValid;
    }
    private get hasNoObserver() {
        return this.hasObserver === false;
    }
    public connectTo(source: rx.Observable<T>): IInputChannel<T> {
        this.source = source;
        this.tryConnectCurrentObserverWithCurrentSource();
        return this;
    }
    public observeWith(observer: IObserverWithSubscription<T>): IInputChannel<T> {
        this.tryConnectCurrentSourceWith(observer);
        return this;
    }
    public get isDisconnected(): boolean {
        const source = this.source;
        if (my(source).isNullOrUndefined) {
            return true;
        }

        if (this.hasNoObserver) {
            return true;
        }

        const observer = this.observerWithSubscription;
        if (my(observer).is(observerWithNoActiveSubscription)) {
            return true;
        }

        return false;
    }
    private tryConnectCurrentObserverWithCurrentSource(): void {
        const observer = this.observerWithSubscription;

        if (my(observer).is(observerWithNoActiveSubscription)) {
            this.observerWithSubscription.subscription = this.source.subscribe(this.observerWithSubscription.observer);
            return;
        }
        if (my(observer).is(observerWithActiveSubcription)) {
            this.observerWithSubscription.subscription.unsubscribe();
            this.observerWithSubscription.subscription = this.source.subscribe(this.observerWithSubscription.observer);
            return;
        }
    }
    private tryDisconnectCurrentObserver() {
        const observer = this.observerWithSubscription;
        if (my(observer).is(observerWithActiveSubcription)) {
            this.observerWithSubscription.subscription.unsubscribe();
        }
    }
    private tryConnectCurrentSourceWith(observer: IObserverWithSubscription<T>): void {
        if (my(observer).isNullOrUndefinedOrEmpty) {
            return;
        }
        this.tryDisconnectCurrentObserver();
        this.observerWithSubscription = {...observer};
        const source = this.source;
        if (my(source).isNullOrUndefined) {
            return;
        }
        observer.subscription = this.observerWithSubscription.subscription
                              = source.subscribe(this.observerWithSubscription.observer);
    }
}
