<?php

namespace Tests\Unit;

use App\Support\ResponsiveImage;
use Tests\TestCase;

class ResponsiveImageTest extends TestCase
{
    public function test_variants_returns_empty_array_for_missing_image(): void
    {
        $this->assertSame([], ResponsiveImage::variants('section/does-not-exist.jpg'));
    }

    public function test_dimensions_returns_null_for_missing_image(): void
    {
        $this->assertNull(ResponsiveImage::dimensions('section/does-not-exist.jpg'));
    }

    public function test_srcset_formats_width_descriptors(): void
    {
        $srcset = ResponsiveImage::srcset([480 => 'https://example.test/a-480.webp', 960 => 'https://example.test/a-960.webp']);

        $this->assertSame('https://example.test/a-480.webp 480w, https://example.test/a-960.webp 960w', $srcset);
    }
}
