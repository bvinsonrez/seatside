import { DemoProvider } from './state/DemoContext';
import DemoStage from './layout/DemoStage';

export default function App() {
  return (
    <DemoProvider>
      <DemoStage />
    </DemoProvider>
  );
}
