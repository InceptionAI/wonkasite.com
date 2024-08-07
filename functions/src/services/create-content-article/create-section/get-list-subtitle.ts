import { openai } from '../../../lib/open-ai';
import { getListOfSubjectSecretPrompt } from '../../../private/content';
import { preprocessJSON } from '../../preprocessJSON';

export const getListSubtitle = async (subject: string, target_audience: string, mission: string): Promise<string[]> => {
  const prompt = await getListOfSubjectSecretPrompt(subject, target_audience, mission);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', //TODO: Tester différente version de gpt
    // response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: prompt.system,
      },
      {
        role: 'user',
        content: prompt.user,
      },
    ],
  });

  const result = preprocessJSON(completion.choices[0].message?.content ?? '');

  if (!result) {
    return [];
  }
  try {
    JSON.parse(result);
  } catch (error) {
    console.log('Error parse in get-list-subcategories.ts: ', error);
    return [];
  }
  const data: string[] = JSON.parse(result);

  return data;
};
