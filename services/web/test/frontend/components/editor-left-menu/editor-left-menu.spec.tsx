import EditorLeftMenu from '../../../../frontend/js/features/editor-left-menu/components/editor-left-menu'
import {
  AllowedImageName,
  MainDocument,
  OverallThemeMeta,
  SpellCheckLanguage,
} from '../../../../types/project-settings'
import { EditorProviders } from '../../helpers/editor-providers'
import { mockScope } from './scope'

describe('<EditorLeftMenu />', function () {
  beforeEach(function () {
    cy.viewport(800, 800)
    cy.interceptCompile()
  })

  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip('for non-anonymous users', function () {
    const overallThemes: OverallThemeMeta[] = [
      {
        name: 'Overall Theme 1',
        val: '',
        path: 'https://overleaf.com/overalltheme-1.css',
      },
      {
        name: 'Overall Theme 2',
        val: 'light-',
        path: 'https://overleaf.com/overalltheme-2.css',
      },
    ]

    const allowedImageNames: AllowedImageName[] = [
      {
        imageDesc: 'Image 1',
        imageName: 'img-1',
      },
      {
        imageDesc: 'Image 2',
        imageName: 'img-2',
      },
    ]

    beforeEach(function () {
      window.metaAttributesCache.set('ol-overallThemes', overallThemes)
      window.metaAttributesCache.set('ol-allowedImageNames', allowedImageNames)
      window.metaAttributesCache.set('ol-anonymous', false)
      window.metaAttributesCache.set('ol-showSupport', true)
      window.metaAttributesCache.set('ol-user', {
        email: 'sherlock@holmes.co.uk',
        first_name: 'Sherlock',
        last_name: 'Holmes',
      })
    })

    it('render full menu', function () {
      const scope = mockScope({
        ui: {
          leftMenuShown: true,
        },
      })

      cy.mount(
        <EditorProviders scope={scope}>
          <EditorLeftMenu />
        </EditorProviders>
      )

      // Download Menu
      cy.findByRole('heading', { name: 'Download' })
      cy.findByRole('link', { name: 'Source' })
      cy.findByRole('link', { name: 'PDF' })

      // Actions Menu
      cy.findByRole('heading', { name: 'Actions' })
      cy.findByRole('button', { name: 'Copy Project' })
      cy.findByRole('button', { name: 'Word Count' })

      // Sync Menu
      cy.findByRole('heading', { name: 'Sync' })
      cy.findByRole('button', { name: 'Dropbox' })
      cy.findByRole('button', { name: 'Git' })
      cy.findByRole('button', { name: 'GitHub' })

      // Settings Menu
      cy.findByRole('heading', { name: 'Settings' })
      cy.findByLabelText('Compiler')
      cy.findByLabelText('TeX Live version')
      cy.findByLabelText('Main document')
      cy.findByLabelText('Spell check')
      cy.findByLabelText('Auto-complete')
      cy.findByLabelText('Auto-close Brackets')
      cy.findByLabelText('Code check')
      cy.findByLabelText('Editor theme')
      cy.findByLabelText('Overall theme')
      cy.findByLabelText('Keybindings')
      cy.findByLabelText('Font Size')
      cy.findByLabelText('Font Family')
      cy.findByLabelText('Line Height')
      cy.findByLabelText('PDF Viewer')

      // Help Menu
      cy.findByRole('heading', { name: 'Help' })
      cy.findByRole('button', { name: 'Show Hotkeys' })
      cy.findByRole('link', { name: 'Documentation' })
      cy.findByRole('button', { name: 'Contact Us' })
    })

    describe('download menu', function () {
      it('have a correct source & pdf download url', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('link', { name: 'Source' }).should(
          'have.attr',
          'href',
          '/project/project123/download/zip'
        )

        cy.findByRole('link', { name: 'PDF' })
          .should('have.attr', 'href')
          .and('match', /\/download\/project\/project123\/build/)
      })
    })

    describe('actions menu', function () {
      it('shows copy project modal correctly', function () {
        cy.intercept('POST', '/project/*/clone', {
          body: {
            project_id: 'new_project_id',
          },
        })

        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('button', { name: 'Copy Project' }).click()
        cy.findByRole('heading', { name: 'Copy Project' })

        // try closing & re-opening the modal with different methods
        cy.findByRole('button', { name: 'Close' }).click()
        cy.findByRole('button', { name: 'Copy Project' }).click()
        cy.findByRole('button', { name: 'Cancel' }).click()
        cy.findByRole('button', { name: 'Copy Project' }).click()

        cy.findByLabelText('New Name').focus()
        cy.findByLabelText('New Name').clear()
        cy.findByLabelText('New Name').type('Project Renamed')
        cy.get('#clone-project-form-name[value="Project Renamed"')
      })

      it('shows word count modal correctly', function () {
        cy.intercept('GET', '/project/*/wordcount*', {
          texcount: {
            encode: 'ascii',
            textWords: 781,
            headWords: 66,
            outside: 11,
            headers: 41,
            elements: 2,
            mathInline: 6,
            mathDisplay: 1,
            errors: 0,
          },
        })

        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('button', { name: 'Word Count' }).click()
        cy.findByText('Total Words:')
        cy.findByText('781')
        cy.findByText('Headers:')
        cy.findByText('41')
        cy.findByText('Math Inline:')
        cy.findByText('6')
        cy.findByText('Math Display:')
        cy.findByText('1')
      })
    })

    describe('sync menu', function () {
      it('shows dropbox modal correctly', function () {
        cy.intercept('GET', '/dropbox/status', {
          registered: true,
        })

        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
          project: {
            members: [],
            owner: {
              _id: '123',
            },
          },
          user: {
            features: {
              dropbox: false,
            },
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('button', { name: 'Dropbox' }).click()
        cy.findByText('Dropbox Sync')
      })

      it('shows git modal correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('button', { name: 'Git' }).click()
        cy.findByText('Clone with Git')
        cy.findByText(/your project using the link displayed below/)
      })

      it('shows github modal correctly', function () {
        cy.intercept('GET', '/user/github-sync/status', {
          available: false,
          enabled: false,
        })

        cy.intercept('GET', '/project/*/github-sync/status', {
          enabled: false,
        })

        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('button', { name: 'GitHub' }).click()
        cy.findByText('GitHub Sync')
        cy.findByText('Push to GitHub, pull to Overleaf')
      })
    })

    describe('settings menu', function () {
      it('shows compiler menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-compiler option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq([
              'pdflatex',
              'latex',
              'xelatex',
              'lualatex',
            ])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq([
              'pdfLaTeX',
              'LaTeX',
              'XeLaTeX',
              'LuaLaTeX',
            ])
          }
        )
      })

      it('shows texlive version menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-imageName option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq(['img-1', 'img-2'])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq(['Image 1', 'Image 2'])
          }
        )
      })

      it('shows document menu correctly', function () {
        const docs: MainDocument[] = [
          {
            path: 'main.tex',
            doc: {
              name: 'main.tex',
              id: 'id1',
              type: 'doc',
              selected: false,
            } as MainDocument['doc'],
          },
          {
            path: 'main2.tex',
            doc: {
              name: 'main2.tex',
              id: 'id2',
              type: 'doc',
              selected: false,
            } as MainDocument['doc'],
          },
        ]

        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
          docs,
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-rootDocId option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq(['id1', 'id2'])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq(['main.tex', 'main2.tex'])
          }
        )
      })

      it('shows spellcheck menu correctly', function () {
        const languages: SpellCheckLanguage[] = [
          {
            name: 'Lang 1',
            code: 'lang-1',
          },
          {
            name: 'Lang 2',
            code: 'lang-2',
          },
        ]

        window.metaAttributesCache.set('ol-languages', languages)

        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>(
          '#settings-menu-spellCheckLanguage option'
        ).then(options => {
          const values = [...options].map(o => o.value)
          expect(values).to.deep.eq(['', 'lang-1', 'lang-2'])

          const texts = [...options].map(o => o.text)
          expect(texts).to.deep.eq(['Off', 'Lang 1', 'Lang 2'])
        })
      })

      it('shows dictionary modal correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get('label[for="dictionary"] ~ button').click()
        cy.findByText('Edit Dictionary')
        cy.findByText('Your custom dictionary is empty.')
      })

      it('shows auto-complete menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-autoComplete option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq(['true', 'false'])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq(['On', 'Off'])
          }
        )
      })

      it('shows auto-close brackets menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>(
          '#settings-menu-autoPairDelimiters option'
        ).then(options => {
          const values = [...options].map(o => o.value)
          expect(values).to.deep.eq(['true', 'false'])

          const texts = [...options].map(o => o.text)
          expect(texts).to.deep.eq(['On', 'Off'])
        })
      })

      it('shows code check menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>(
          '#settings-menu-syntaxValidation option'
        ).then(options => {
          const values = [...options].map(o => o.value)
          expect(values).to.deep.eq(['true', 'false'])

          const texts = [...options].map(o => o.text)
          expect(texts).to.deep.eq(['On', 'Off'])
        })
      })

      it('shows editor theme menu correctly', function () {
        const editorThemes = ['editortheme-1', 'editortheme-2', 'editortheme-3']

        const legacyEditorThemes = [
          'legacytheme-1',
          'legacytheme-2',
          'legacytheme-3',
        ]

        window.metaAttributesCache.set('ol-editorThemes', editorThemes)
        window.metaAttributesCache.set(
          'ol-legacyEditorThemes',
          legacyEditorThemes
        )

        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-editorTheme option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq([
              'editortheme-1',
              'editortheme-2',
              'editortheme-3',
              '-',
              'legacytheme-1',
              'legacytheme-2',
              'legacytheme-3',
            ])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq([
              'editortheme-1',
              'editortheme-2',
              'editortheme-3',
              '—————————————————',
              'legacytheme-1',
              'legacytheme-2',
              'legacytheme-3',
            ])
          }
        )
      })

      it('shows overall theme menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-overallTheme option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq(['', 'light-'])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq(['Overall Theme 1', 'Overall Theme 2'])
          }
        )
      })

      it('shows keybindings menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-mode option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq(['default', 'vim', 'emacs'])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq(['None', 'Vim', 'Emacs'])
          }
        )
      })

      it('shows font size menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-fontSize option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq([
              '10',
              '11',
              '12',
              '13',
              '14',
              '16',
              '18',
              '20',
              '22',
              '24',
            ])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq([
              '10px',
              '11px',
              '12px',
              '13px',
              '14px',
              '16px',
              '18px',
              '20px',
              '22px',
              '24px',
            ])
          }
        )
      })

      it('shows font family menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-fontFamily option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq(['monaco', 'lucida'])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq([
              'Monaco / Menlo / Consolas',
              'Lucida / Source Code Pro',
            ])
          }
        )
      })

      it('shows line height menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-lineHeight option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq(['compact', 'normal', 'wide'])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq(['Compact', 'Normal', 'Wide'])
          }
        )
      })

      it('shows pdf viewer menu correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.get<HTMLOptionElement>('#settings-menu-pdfViewer option').then(
          options => {
            const values = [...options].map(o => o.value)
            expect(values).to.deep.eq(['pdfjs', 'native'])

            const texts = [...options].map(o => o.text)
            expect(texts).to.deep.eq(['Overleaf', 'Browser'])
          }
        )
      })
    })

    describe('help menu', function () {
      it('shows hotkeys modal correctly', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('button', { name: 'Show Hotkeys' }).click()
        cy.findByText('Hotkeys (Source editor)')
      })

      it('shows correct url for documentation', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('link', { name: 'Documentation' }).should(
          'have.attr',
          'href',
          '/learn'
        )
      })

      it('shows correct contact us modal', function () {
        const scope = mockScope({
          ui: {
            leftMenuShown: true,
          },
        })

        cy.mount(
          <EditorProviders scope={scope}>
            <EditorLeftMenu />
          </EditorProviders>
        )

        cy.findByRole('button', { name: 'Contact Us' }).click()
        cy.findByText('Affected project URL (Optional)')
      })
    })
  })

  describe('for anonymous users', function () {
    it('render minimal menu', function () {
      const scope = mockScope({
        ui: {
          leftMenuShown: true,
        },
      })
      window.metaAttributesCache.set('ol-anonymous', true)

      cy.mount(
        <EditorProviders scope={scope}>
          <EditorLeftMenu />
        </EditorProviders>
      )

      // Download Menu
      cy.findByRole('heading', { name: 'Download' })
      cy.findByRole('link', { name: 'Source' })
      cy.findByRole('link', { name: 'PDF' })

      // Actions Menu
      cy.findByRole('heading', { name: 'Actions' }).should('not.exist')
      cy.findByRole('button', { name: 'Copy Project' }).should('not.exist')
      cy.findByRole('button', { name: 'Word Count' }).should('not.exist')

      // Sync Menu
      cy.findByRole('heading', { name: 'Sync' }).should('not.exist')
      cy.findByRole('button', { name: 'Dropbox' }).should('not.exist')
      cy.findByRole('button', { name: 'Git' }).should('not.exist')
      cy.findByRole('button', { name: 'GitHub' }).should('not.exist')

      // Settings Menu
      cy.findByRole('heading', { name: 'Settings' }).should('not.exist')
      cy.findByLabelText('Compiler').should('not.exist')
      cy.findByLabelText('TeX Live version').should('not.exist')
      cy.findByLabelText('Main document').should('not.exist')
      cy.findByLabelText('Spell check').should('not.exist')
      cy.findByLabelText('Auto-complete').should('not.exist')
      cy.findByLabelText('Auto-close Brackets').should('not.exist')
      cy.findByLabelText('Code check').should('not.exist')
      cy.findByLabelText('Editor theme').should('not.exist')
      cy.findByLabelText('Overall theme').should('not.exist')
      cy.findByLabelText('Keybindings').should('not.exist')
      cy.findByLabelText('Font Size').should('not.exist')
      cy.findByLabelText('Font Family').should('not.exist')
      cy.findByLabelText('Line Height').should('not.exist')
      cy.findByLabelText('PDF Viewer').should('not.exist')

      // Help Menu
      cy.findByRole('heading', { name: 'Help' })
      cy.findByRole('button', { name: 'Show Hotkeys' })
      cy.findByRole('button', { name: 'Documentation' }).should('not.exist')
      cy.findByRole('link', { name: 'Contact Us' }).should('not.exist')
    })
  })
})
