using System;
using Security;
using Xunit;

namespace Tests
{
    public class BasicHtmlSanitizerTests
    {
        private readonly IHtmlSanitizer _sanitizer = new BasicHtmlSanitizer();

        [Fact]
        public void Sanitize_RemovesScriptTags()
        {
            var input = "<script>alert('x')</script><p>hello</p>";
            var outp = _sanitizer.Sanitize(input);
            Assert.Contains("<p>", outp);
            Assert.DoesNotContain("script", outp, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void Sanitize_PreservesAllowedTags()
        {
            var input = "<p>Hello <strong>World</strong></p>";
            var outp = _sanitizer.Sanitize(input);
            Assert.Equal("<p>Hello <strong>World</strong></p>", outp);
        }

        [Fact]
        public void Sanitize_RemovesOnClickAttributes()
        {
            var input = "<a onclick=\"evil()\" href=\"#\">link</a>";
            var outp = _sanitizer.Sanitize(input);
            // attributes are stripped, but link text remains and tag preserved
            Assert.Contains("link", outp);
            Assert.DoesNotContain("onclick", outp, StringComparison.OrdinalIgnoreCase);
        }
    }
}
