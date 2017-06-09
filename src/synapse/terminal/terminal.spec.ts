import { my } from "my-ts";
import * as rx from "rxjs";
import { IObserverWithSubscription } from "../common/synapse.interface";
import { IOutputChannel} from "./terminal.interface";
import { Terminal } from "./terminal.template";

let terminal: IOutputChannel<any>;
let sourceStream: rx.Subject<any>;
let otherSourceStream: rx.Subject<any>;
let observerWithSubscription: IObserverWithSubscription<any> ;
let otherObserverWithSubscription: IObserverWithSubscription<any> ;
let nextMethodOfObserver: jest.SpyInstance<any>;
let nextMethodOfOtherObserver: jest.SpyInstance<any>;

// tslint:disable:no-console
// tslint:disable:object-literal-sort-keys
// tslint:disable:max-line-length

beforeAll(() => {
    observerWithSubscription = {
        observer : {
            next: (x) => {
                console.log("Observer got a next value: " + x); },
            error: (err) => console.error("Observer got an error: " + err),
            complete: () => console.log("Observer got a complete notification"),
        },
        subscription: null,
    };
    otherObserverWithSubscription = {
        observer : {
            next: (x) => {
                console.log("Other Observer got a next value: " + x); },
            error: (err) => console.error("Other Observer got an error: " + err),
            complete: () => console.log("Other Observer got a complete notification"),
        },
        subscription: null,
    };
});

beforeEach(() => {
    terminal = new Terminal<any>();
    sourceStream = new rx.Subject();
    otherSourceStream = new rx.Subject();
    nextMethodOfObserver = jest.spyOn(observerWithSubscription.observer, "next");
    nextMethodOfOtherObserver = jest.spyOn(otherObserverWithSubscription.observer, "next");
});

afterEach(() => {
    nextMethodOfObserver.mockRestore();
    nextMethodOfOtherObserver.mockRestore();
    sourceStream.complete();
    otherSourceStream.complete();
});

test("terminal has no connections initially", () => {
    // Given

    // When

    // Then
    expect(terminal.hasConnections).toBeFalsy();
});

test(`Given a terminal has no observer
      When a data is transmitted to this terminal
      Then the terminal should do nothing`
    , () => {
    // Given

    // When
    terminal.transmit(0);

    // Then
    expect(terminal.hasConnections).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(0);
});

test(`Given a terminal has one observer
      When a data is transmitted to this terminal
      Then the observer should receive this data`
    , () => {
    // Given
    terminal.observeWith(observerWithSubscription);

    // When
    terminal.transmit(0);

    // Then
    expect(terminal.hasConnections).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
});
