import {my} from "my-ts";
import * as rx from "rxjs";
import { IInputChannel,  IObserverWithSubscription} from "./input-channel.interface";
import {InputChannel} from "./input-channel.template";

let inputChannel: IInputChannel<any>;
let sourceStream: rx.Subject<any>;
let otherSourceStream: rx.Subject<any>;
let observer: rx.Observer<any>;
let nextMethodOfObserver: jest.SpyInstance<any>;

// tslint:disable:no-console
// tslint:disable:object-literal-sort-keys
// tslint:disable:max-line-length

beforeAll(() => {
    observer = {
        next: (x) => {
            console.log("Observer got a next value: " + x); },
        error: (err) => console.error("Observer got an error: " + err),
        complete: () => console.log("Observer got a complete notification"),
    };
});

beforeEach(() => {
    inputChannel = new InputChannel<any>();
    sourceStream = new rx.Subject();
    otherSourceStream = new rx.Subject();
    nextMethodOfObserver = jest.spyOn(observer, "next");
});

afterEach(() => {
    nextMethodOfObserver.mockRestore();
    sourceStream.complete();
    otherSourceStream.complete();
});

test("Synapse Input channel is initially disconnected", () => {
    // Given

    // When

    // Then
    expect(inputChannel.isDisconnected).toBeTruthy();
});
