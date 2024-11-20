import { fetchWikiIdAndName } from './Feed'; 
jest.mock('./Feed', () => ({
  fetchWikiIdAndName: jest.fn(),
}));

// Mock the navigate function
const navigate = jest.fn();

describe('handleRelatedInstanceClick', () => {
  const handleRelatedInstanceClick = async (instance) => {
    const wikiIdAndName = await fetchWikiIdAndName(instance.relatedLanguageLabel);
    const wikiId = wikiIdAndName[0];
    const wikiName = wikiIdAndName[1];
    if (wikiId) {
      navigate(`/result/${wikiId}/${encodeURIComponent(wikiName)}`);
    } else {
      console.error('No wiki ID found for related instance:', instance);
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to the correct URL when wikiId is found', async () => {
    const instance = { relatedLanguageLabel: 'SampleLanguage' };
    const wikiIdAndName = ['12345', 'Sample Wiki'];
    fetchWikiIdAndName.mockResolvedValue(wikiIdAndName);

    await handleRelatedInstanceClick(instance);

    expect(fetchWikiIdAndName).toHaveBeenCalledWith('SampleLanguage');
    expect(navigate).toHaveBeenCalledWith('/result/12345/Sample%20Wiki');
  });
});
