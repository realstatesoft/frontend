import { useEffect, useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import styles from './ContractTemplateRichEditor.module.scss';

function MenuBar({ editor, disabled }) {
  if (!editor) {
    return (
      <div className={styles.menuBar} aria-hidden>
        <span className="text-muted small">Cargando editor…</span>
      </div>
    );
  }

  const run = (fn) => {
    if (disabled) return;
    fn();
  };

  const setLink = () => {
    if (disabled) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enlace (URL)', prev || 'https://');
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
  };

  return (
    <div className={styles.menuBar} role="toolbar" aria-label="Formato del texto">
      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('bold') ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleBold().run())}
        disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
        aria-label="Negrita"
        title="Negrita"
      >
        B
      </button>
      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('italic') ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleItalic().run())}
        disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
        aria-label="Cursiva"
        title="Cursiva"
      >
        I
      </button>
      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('underline') ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleUnderline().run())}
        disabled={disabled || !editor.can().chain().focus().toggleUnderline().run()}
        aria-label="Subrayado"
        title="Subrayado"
      >
        U
      </button>
      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('strike') ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleStrike().run())}
        disabled={disabled || !editor.can().chain().focus().toggleStrike().run()}
        aria-label="Tachado"
        title="Tachado"
      >
        S
      </button>

      <span className={styles.menuDivider} aria-hidden />

      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('heading', { level: 2 }) ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        disabled={disabled}
        aria-label="Título 2"
        title="Título"
      >
        Título
      </button>
      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('heading', { level: 3 }) ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        disabled={disabled}
        aria-label="Subtítulo"
        title="Subtítulo"
      >
        Subtítulo
      </button>
      <button
        type="button"
        className={styles.menuBtn}
        onClick={() => run(() => editor.chain().focus().setParagraph().run())}
        disabled={disabled}
        aria-label="Párrafo normal"
        title="Párrafo"
      >
        Párrafo
      </button>

      <span className={styles.menuDivider} aria-hidden />

      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('bulletList') ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleBulletList().run())}
        disabled={disabled || !editor.can().chain().focus().toggleBulletList().run()}
        aria-label="Lista con viñetas"
        title="Lista con viñetas"
      >
        • Lista
      </button>
      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('orderedList') ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleOrderedList().run())}
        disabled={disabled || !editor.can().chain().focus().toggleOrderedList().run()}
        aria-label="Lista numerada"
        title="Lista numerada"
      >
        1. Lista
      </button>
      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('blockquote') ? styles.menuBtnActive : ''}`}
        onClick={() => run(() => editor.chain().focus().toggleBlockquote().run())}
        disabled={disabled || !editor.can().chain().focus().toggleBlockquote().run()}
        aria-label="Cita"
        title="Cita"
      >
        Cita
      </button>

      <span className={styles.menuDivider} aria-hidden />

      <button
        type="button"
        className={`${styles.menuBtn} ${editor.isActive('link') ? styles.menuBtnActive : ''}`}
        onClick={setLink}
        disabled={disabled}
        aria-label="Enlace"
        title="Insertar o editar enlace"
      >
        Enlace
      </button>
      <button
        type="button"
        className={styles.menuBtn}
        onClick={() => run(() => editor.chain().focus().setHorizontalRule().run())}
        disabled={disabled}
        aria-label="Línea horizontal"
        title="Línea horizontal"
      >
        ─
      </button>

      <span className={styles.menuDivider} aria-hidden />

      <button
        type="button"
        className={styles.menuBtn}
        onClick={() => run(() => editor.chain().focus().undo().run())}
        disabled={disabled || !editor.can().chain().focus().undo().run()}
        aria-label="Deshacer"
        title="Deshacer"
      >
        ↶
      </button>
      <button
        type="button"
        className={styles.menuBtn}
        onClick={() => run(() => editor.chain().focus().redo().run())}
        disabled={disabled || !editor.can().chain().focus().redo().run()}
        aria-label="Rehacer"
        title="Rehacer"
      >
        ↷
      </button>
    </div>
  );
}

/**
 * Editor enriquecido para plantillas (HTML). Valor y onChange en HTML.
 */
export default function ContractTemplateRichEditor({ value, onChange, placeholder, disabled }) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        },
        underline: {},
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escribe el contenido base del contrato…',
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions,
    content: value || '',
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'contract-template-prose',
        spellCheck: 'true',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const incoming = value || '';
    const current = editor.getHTML();
    if (incoming !== current) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  return (
    <div className={styles.wrap}>
      <MenuBar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
