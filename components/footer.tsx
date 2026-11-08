
import { I18nText } from "@/components/i18n-text";
export default function Footer() {
  return (
    <footer className="border-t py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Otakuz</h3>
            <p className="text-sm text-muted-foreground">
              <I18nText message="footer.description" />
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4"><I18nText message="footer.quickLinks" /></h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-muted-foreground hover:text-foreground">
                  <I18nText message="footer.about" />
                </a>
              </li>
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-foreground">
                  <I18nText message="footer.contact" />
                </a>
              </li>
              <li>
                <a href="/faq" className="text-muted-foreground hover:text-foreground">
                  <I18nText message="footer.faq" />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4"><I18nText message="footer.legal" /></h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-foreground">
                  <I18nText message="footer.privacy" />
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-foreground">
                  <I18nText message="footer.terms" />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4"><I18nText message="footer.connect" /></h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Reddit
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Otakuz. <I18nText message="footer.rights" /></p>
        </div>
      </div>
    </footer>
  );
}