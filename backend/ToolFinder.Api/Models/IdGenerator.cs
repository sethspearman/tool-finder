namespace ToolFinder.Api.Models;

public static class IdGenerator
{
    // Excludes ambiguous characters: 0, O, 1, I, L
    private const string Chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

    public static string Generate(int length = 6)
    {
        return new string(Enumerable.Range(0, length)
            .Select(_ => Chars[Random.Shared.Next(Chars.Length)])
            .ToArray());
    }
}
