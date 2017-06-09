import {my} from "my-ts";
import * as rx from "rxjs";
import {IObserverWithSubscription} from "../common/synapse.interface";
import {IOutputChannel} from "./terminal.interface";
export class Terminal<T> implements IOutputChannel<T> {
    private outputChannel: rx.Subject<T>;
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
        this.ensureOutputChannelIsInitialized();
        observerWithSubscription.subscription =
            this.outputChannel.subscribe(observerWithSubscription.observer);
    }
    private ensureOutputChannelIsInitialized(): void {
        const channel = this.outputChannel;
        if (my(channel).isNullOrUndefinedOrEmpty) {
            this.outputChannel = new rx.Subject<T>();
            return;
        }
    }
    private tryTransmit(vesicle: T): void {
        if (my(vesicle).isNullOrUndefinedOrEmpty) {
            return;
        }
        if (this.hasNoConnection) {
            return;
        }
        this.outputChannel.next(vesicle);
    }
}
