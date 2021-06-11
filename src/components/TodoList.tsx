import { useTranslation } from 'react-i18next';

import Section from './Section';

const TodoList: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Section title={t('todos')} badgeNumber={4}>
      TODO: THIS LIST!
    </Section>
  );
};
export default TodoList;
