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
let badObserverWithSubscription: IObserverWithSubscription<any>;
let nextMethodOfObserver: jest.SpyInstance<any>;
let nextMethodOfOtherObserver: jest.SpyInstance<any>;
let nextMethodOfBadObserver: jest.SpyInstance<any>;

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
        id: "o1",
    };
    otherObserverWithSubscription = {
        observer : {
            next: (x) => {
                console.log("Other Observer got a next value: " + x); },
            error: (err) => console.error("Other Observer got an error: " + err),
            complete: () => console.log("Other Observer got a complete notification"),
        },
        subscription: null,
        id: "o2",
    };
    badObserverWithSubscription = {
        observer : {
            next: (x) => {
                throw new Error("exception raised by Bad Observer");
                 },
            error: (err) => console.error("Bad Observer got an error: " + err),
            complete: () => console.log("Bad Observer got a complete notification"),
        },
        subscription: null,
        id: "bad1",
    };
});

beforeEach(() => {
    terminal = new Terminal<any>();
    sourceStream = new rx.Subject();
    otherSourceStream = new rx.Subject();
    nextMethodOfObserver = jest.spyOn(observerWithSubscription.observer, "next");
    nextMethodOfOtherObserver = jest.spyOn(otherObserverWithSubscription.observer, "next");
    nextMethodOfBadObserver = jest.spyOn(badObserverWithSubscription.observer, "next");
});

afterEach(() => {
    nextMethodOfObserver.mockRestore();
    nextMethodOfOtherObserver.mockRestore();
    nextMethodOfBadObserver.mockRestore();
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

test(`Given a terminal has no observer
      And a data is transmitted to this terminal
      When an observer connects
      and a new data is transmitted to this terminal
      Then the observer should receive this new data only`
    , () => {
    // Given
    terminal.transmit(0);

    // When
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(1);

    // Then
    expect(terminal.hasConnections).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(1);
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

test(`Given a terminal has one observer
      When the same observer connects again
      and a data is transmitted to this terminal
      Then the observer should receive this data only once`
    , () => {
    // Given
    terminal.observeWith(observerWithSubscription);

    // When
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(0);

    // Then
    expect(terminal.hasConnections).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
});

test(`Given a terminal has one observer
      And a data is transmitted to this terminal
      When the same observer connects again
      And a new data is transmitted to this terminal
      Then the observer should receive this new data only once`
    , () => {
    // Given
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(0);

    // When
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(1);

    // Then
    expect(terminal.hasConnections).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(1);
});

test(`Given a terminal has one observer
      When this observer disconnects
      And a data is transmitted to this terminal
      Then the observer should not receive data anymore`
    , () => {
    // Given
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(0);

    // When
    observerWithSubscription.subscription.unsubscribe();
    terminal.transmit(1);
    terminal.transmit(2);

    // Then
    expect(terminal.hasConnections).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
});

test(`Given a terminal has one observer
      And a data is transmitted to this terminal
      When this observer disconnects
      And the same observer connects again
      And a data is transmitted to this terminal
      Then the observer should receive this data`
    , () => {
    // Given
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(0);

    // When
    observerWithSubscription.subscription.unsubscribe();
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(1);

    // Then
    expect(terminal.hasConnections).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(1);
});

test(`Given a terminal has one observer
      And a data is transmitted to this terminal
      When this observer disconnects
      And a data is transmitted to this terminal
      And the same observer connects again
      And a data is transmitted to this terminal
      Then the observer should receive first and last data`
    , () => {
    // Given
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(0);

    // When
    observerWithSubscription.subscription.unsubscribe();
    terminal.transmit(1);
    terminal.observeWith(observerWithSubscription);
    terminal.transmit(2);

    // Then
    expect(terminal.hasConnections).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(2);
});

test(`Given a terminal has two observers
      When a data is transmitted to this terminal
      Then both observers should receive this data`
    , () => {
    // Given
    terminal.observeWith(observerWithSubscription);
    terminal.observeWith(otherObserverWithSubscription);

    // When
    terminal.transmit(0);

    // Then
    expect(terminal.hasConnections).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfOtherObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfOtherObserver).toBeCalledWith(0);
});

test(`Given a terminal has two observers
      When a data is transmitted to this terminal
      And both observers disconnect
      Then both observers should not receive any more data
      And terminal should have no connection`
    , () => {
    // Given
    terminal.observeWith(observerWithSubscription);
    terminal.observeWith(otherObserverWithSubscription);

    // When
    terminal.transmit(0);
    observerWithSubscription.subscription.unsubscribe();
    otherObserverWithSubscription.subscription.unsubscribe();
    terminal.transmit(1);

    // Then
    expect(terminal.hasConnections).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfOtherObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfOtherObserver).toBeCalledWith(0);
});

test(`Given a terminal has one observer
      When a data is transmitted to this terminal
      And this observer throws an error
      Then this observer should not receive any more data
      And this observer should be automatically disconnected`
    , () => {
    // Given
    terminal.observeWith(badObserverWithSubscription);

    // When
    terminal.transmit(0);
    terminal.transmit(1);

    // Then
    expect(terminal.hasConnections).toBeFalsy();
    expect(nextMethodOfBadObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfBadObserver).toBeCalledWith(0);
});

test(`Given a terminal has two observers
      When a data is transmitted to this terminal
      And the first observer throws an error
      Then the second observer should receive this data
      And any other data transmitted afterwards
      But the first observer should not receive any more data`
    , () => {
    // Given
    terminal.observeWith(badObserverWithSubscription)
            .observeWith(observerWithSubscription);

    // When
    terminal.transmit(0);
    terminal.transmit(1);

    // Then
    expect(terminal.hasConnections).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(1);
    expect(nextMethodOfBadObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfBadObserver).toBeCalledWith(0);
});
