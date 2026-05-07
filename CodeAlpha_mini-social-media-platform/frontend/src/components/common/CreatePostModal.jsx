//frontend/src/components/common/CreatePostModal.jsx
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiImage, FiX, FiTag } from 'react-icons/fi';
import Modal from './Modal';
import Avatar from './Avatar';
import Button from './Button';
import { createPost } from '../../redux/slices/postSlice';

const CreatePostModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { createLoading } = useSelector((state) => state.posts);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [tags, setTags] = useState('');
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (image) formData.append('image', image);
    if (tags) formData.append('tags', tags);

    const result = await dispatch(createPost(formData));
    if (!result.error) onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Create Post" maxWidth="560px">
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Avatar src={user?.profilePicture} size={44} username={user?.username} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.username}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Public post</p>
          </div>
        </div>

        {/* Text area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.username}?`}
          maxLength={2000}
          rows={4}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '1rem',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            marginBottom: '0.75rem',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: content.length > 1900 ? 'var(--error)' : 'var(--text-muted)' }}>
            {content.length}/2000
          </span>
        </div>

        {/* Image Preview */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ position: 'relative', marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
          >
            <img
              src={preview}
              alt="preview"
              style={{ width: '100%', maxHeight: '280px', objectFit: 'cover' }}
            />
            <button
              onClick={removeImage}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <FiX size={15} />
            </button>
          </motion.div>
        )}

        {/* Tags */}
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add tags (comma separated)"
          style={{
            width: '100%',
            padding: '0.6rem 0.875rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
            marginBottom: '1rem',
            fontFamily: 'inherit',
          }}
        />

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Add to your post
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImageChange} style={{ display: 'none' }} />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-hover)',
                border: 'none',
                cursor: 'pointer',
                color: '#10b981',
              }}
              title="Add Image"
            >
              <FiImage size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-hover)',
                border: 'none',
                cursor: 'pointer',
                color: '#f59e0b',
              }}
              title="Add Tag"
            >
              <FiTag size={18} />
            </motion.button>
          </div>
        </div>

        <Button
          fullWidth
          onClick={handleSubmit}
          loading={createLoading}
          disabled={!content.trim() && !image}
        >
          Share Post
        </Button>
      </div>
    </Modal>
  );
};

export default CreatePostModal;