import * as rx from "rxjs";
import {IVesicle} from "../../vesicle/vesicle.interface";
import {IObserverWithSubscription} from "../common/synapse.interface";
export interface IOutputChannel<T>{
    readonly hasConnections: boolean;
    transmit(vesicle: T): IOutputChannel<T>;
    observeWith(observer: IObserverWithSubscription<T>): IOutputChannel<T>;
}
