import {my} from "my-ts";
import * as rx from "rxjs";
import {IObserverWithSubscription} from "../common/synapse.interface";
import {IOutputChannel} from "./terminal.interface";
export class Terminal<T> implements IOutputChannel<T> {
    private outputChannel: rx.Subject<T>;
    private observers: Array<IObserverWithSubscription<T>>;
    public get hasConnections(): boolean {
        const channel = this.outputChannel;
        if (my(channel).isNullOrUndefinedOrEmpty) {
            return false;
        }
        if (my(channel.observers).isNullOrUndefinedOrEmpty) {
            return false;
        }
        return true;
    }
    private get hasNoConnection(): boolean {
        return this.hasConnections === false;
    }
    public transmit(vesicle: T): IOutputChannel<T> {
        this.tryTransmit(vesicle);
        return this;
    }
    public observeWith(observer: IObserverWithSubscription<T>): IOutputChannel<T> {
        this.tryConnectToOutputChannelWith(observer);
        return this;
    }
    private tryConnectToOutputChannelWith(observerWithSubscription: IObserverWithSubscription<T>): void {
        if (my(observerWithSubscription).isNullOrUndefinedOrEmpty) {
            return;
        }
        const newObserver = observerWithSubscription.observer;
        if (my(newObserver).isNullOrUndefined) {
            return;
        }
        this.ensureOutputChannelIsInitialized();
        const observers = this.observers;
        const foundObserver = my(observers).firstOrDefault(
            (element: IObserverWithSubscription<T>, index: number) => {
                if (my(element).isNullOrUndefinedOrEmpty) {
                    return false;
                }
                if (element.id === observerWithSubscription.id) {
                    return true;
                }
                return false;
            });
        if (my(foundObserver).isNullOrUndefined) {
            observerWithSubscription.subscription =
            this.outputChannel.subscribe(observerWithSubscription.observer);
            this.observers.push(observerWithSubscription);
        }
    }
    private ensureOutputChannelIsInitialized(): void {
        this.ensureAllObserversAreStillConnected();
        const channel = this.outputChannel;
        if (my(channel).isNullOrUndefinedOrEmpty) {
            this.outputChannel = new rx.Subject<T>();
            this.observers = [];
            return;
        }
    }
    private ensureAllObserversAreStillConnected(): void {
        const observers = this.observers;
        this.observers = my(observers).where(
            (observer: IObserverWithSubscription<T>, index: number): boolean => {
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
            });
    }
    private tryTransmit(vesicle: T): void {
        if (my(vesicle).isNullOrUndefinedOrEmpty) {
            return;
        }
        if (this.hasNoConnection) {
            return;
        }

        const observers = [...this.outputChannel.observers];
        observers.map( (observer) => {
            try {
                observer.next(vesicle);
            } catch (error) {
                // the faulty observer is automatically removed from the outputChannel
                // this faulty observer will never receive more data until it explicitly resubscribes
            }
        });
    }
}
