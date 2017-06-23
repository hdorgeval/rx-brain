import {my} from "my-ts";
import * as rx from "rxjs";
import {IObserverWithSubscription} from "../common/synapse.interface";
import { IInputChannel } from "../hillock/hillock.interface";
import { IOutputChannel } from "../terminal/terminal.interface";
import {IOneWaySynapse} from "./one-way-synapse.interface";

export class OneWaySynapse<T> implements IOneWaySynapse<T> {
    public get isDisconnected(): boolean {
        return this.hillock.isDisconnected;
    }
    public get hasConnections(): boolean {
        return this.terminal.hasConnections;
    }
    private hillock: IInputChannel<T>;
    private terminal: IOutputChannel<T>;

    /**
     *
     */
    constructor(hillock: IInputChannel<T>, terminal: IOutputChannel<T>) {
        this.hillock = hillock;
        this.terminal = terminal;
    }
    public connectTo(source: rx.Observable<T>): IOneWaySynapse<T> {
        this.hillock.connectTo(source);
        this.tryConnectHillockWithTerminal();
        return this;
    }
    public observeWith(observer: IObserverWithSubscription<T>): IOneWaySynapse<T> {
        this.terminal.observeWith(observer);
        this.tryConnectHillockWithTerminal();
        return this;
    }

    private tryConnectHillockWithTerminal(): void {
        if (this.terminal.hasConnections === false) {
            return;
        }
        this.hillock.observeWith({
            id: "o1",
            observer : {
                // tslint:disable-next-line:no-empty
                complete: () => { } ,
                // tslint:disable-next-line:no-empty
                error: (err) => { } ,
                next: (x) => {
                    this.terminal.transmit(x);
                },
            },
            subscription: null,
    });
    }

}
