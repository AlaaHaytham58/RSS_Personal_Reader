using System.Collections.Generic;

namespace Infrastructure.FeedParsing
{
    public interface IFeedParser
    {
        ParseResult Parse(string rawContent);
    }
}
