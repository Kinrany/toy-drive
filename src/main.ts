import { Stream } from '@most/types';
import { create } from 'most-subject';

type Getter<T> = () => T;
type Setter<T> = (T) => void;

type DriverOutput<T> = Getter<Stream<T>>;
type DriverInput<T> = Setter<Stream<T>>;

type View = {
  [key: string]: DriverOutput<any>
};

type Intent = {
  [key: string]: DriverInput<any>
}

type Model<V extends View, I extends Intent> = (V) => I;

export default function drive<V extends View, I extends Intent>(model: Model<V, I>, view: V, intent: I): void {

  const intentSetters = {};
  Object.keys(intent).forEach(key => {

    // create a Subject
    const [attachSink, source] = create<any>();

    // pass the Subject's output stream
    intent[key](source);

    // save the Subject's sink setter
    intentSetters[key] = attachSink;
  });

  // initialize sources
  const viewStreams = {};
  Object.keys(view).forEach(key => {
    viewStreams[key] = view[key]();
  });

  // initialize sinks 
  const intentStreams = model(viewStreams);

  // start driving
  Object.keys(intentStreams).forEach(key => {
    const setter = intentSetters[key];
    setter(intentStreams[key]);
  });
}