import * as rx from "rxjs";
import { IObserverWithSubscription } from "../../common/common.interfaces";
export interface IOneWaySynapse<T>{
    /**
     * Check if synapse's hillock is connected to the axon of a neuron.
     */
    readonly isDisconnected: boolean;

    /**
     * Check if synapse has observers connected at its terminal
     */
    readonly hasConnections: boolean;

    /**
     * Connect the synapse's hillock to the axon of a neuron
     */
    connectTo(source: rx.Observable<T>): IOneWaySynapse<T>;

    /**
     * Connect the terminal of the synapse with an observer.
     * This observer is typically another neuron
     */
    observeWith(observer: IObserverWithSubscription<T>): IOneWaySynapse<T>;
}
