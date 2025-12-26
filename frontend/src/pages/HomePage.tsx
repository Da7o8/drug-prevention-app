import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './HomePage.module.css';

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  tone: 'calm' | 'trust' | 'hope';
};

const BLOG: BlogPost[] = [
  {
    id: 'stress',
    title: 'Nhận diện sớm căng thẳng tâm lý kéo dài',
    excerpt:
      'Những dấu hiệu thường gặp, cách tự đánh giá mức độ căng thẳng và khi nào nên tìm hỗ trợ chuyên môn.',
    category: 'Sức khỏe tinh thần',
    readTime: '4 phút đọc',
    date: '13/12/2025',
    tone: 'calm',
  },
  {
    id: 'after-rehab',
    title: 'Vai trò của tư vấn tâm lý sau cai nghiện',
    excerpt:
      'Tư vấn giúp giảm nguy cơ tái nghiện, củng cố động lực và xây dựng kế hoạch phục hồi bền vững.',
    category: 'Phục hồi & tái hòa nhập',
    readTime: '5 phút đọc',
    date: '12/12/2025',
    tone: 'trust',
  },
  {
    id: 'when-to-see',
    title: 'Khi nào nên tìm đến chuyên viên tư vấn?',
    excerpt:
      'Nếu bạn mất ngủ kéo dài, lo âu, cảm giác bế tắc hoặc gặp nguy cơ tái nghiện — đừng chờ đến lúc quá muộn.',
    category: 'Hướng dẫn hỗ trợ',
    readTime: '3 phút đọc',
    date: '10/12/2025',
    tone: 'hope',
  },
];

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  const roleLabel =
    user?.role === 'admin'
      ? 'Quản trị hệ thống'
      : user?.role === 'counselor'
      ? 'Chuyên viên tư vấn'
      : 'Người dùng';

  const roleClass =
    user?.role === 'admin'
      ? styles.roleAdmin
      : user?.role === 'counselor'
      ? styles.roleCounselor
      : styles.roleUser;

  return (
    <div className={styles.page}>
      {/* ===== Header ===== */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>HT</div>
            <div className={styles.brandText}>
              <div className={styles.brandTitle}>
                Hệ thống Tư vấn tâm lý & Phòng chống tệ nạn
              </div>
              <div className={styles.brandSub}>
                Nền tảng kết nối người dân với chuyên viên tư vấn
              </div>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userBlock}>
              <div className={styles.userLine}>
                Xin chào, <strong>{user?.name || user?.email}</strong>
              </div>
              <span className={`${styles.roleBadge} ${roleClass}`}>{roleLabel}</span>
            </div>

            <nav className={styles.nav}>
              <Link to="/appointments" className={styles.navLink}>
                Lịch hẹn
              </Link>
              <Link to="/courses" className={styles.navLink}>
                Khóa học
              </Link>
              <button onClick={logout} className={styles.logoutBtn}>
                Đăng xuất
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Tư vấn tâm lý cộng đồng
              <br />
              <span className={styles.heroTitleSoft}>an toàn – tinh tế – đáng tin cậy</span>
            </h1>

            <p className={styles.heroDesc}>
              Hỗ trợ đặt lịch tư vấn nhanh chóng, theo dõi lịch hẹn, và tiếp cận các khóa học phòng chống
              tệ nạn – giúp bạn phục hồi và tái hòa nhập bền vững.
            </p>

            <div className={styles.heroActions}>
              <Link to="/appointments/book" className={styles.primaryBtn}>
                Đặt lịch tư vấn
              </Link>
              <Link to="/courses" className={styles.secondaryBtn}>
                Xem khóa học
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>24/7</div>
                <div className={styles.statLabel}>Tiếp nhận nhu cầu</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>1 giờ</div>
                <div className={styles.statLabel}>Thời lượng mỗi buổi</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>Bảo mật</div>
                <div className={styles.statLabel}>Thông tin cá nhân</div>
              </div>
            </div>
          </div>

          {/* Decorative panel (no external image) */}
          <div className={styles.heroVisual}>
            <div className={styles.visualCard}>
              <div className={styles.visualTitle}>Gợi ý nhanh</div>
              <ul className={styles.visualList}>
                <li>Chọn khung giờ phù hợp</li>
                <li>Ghi rõ nội dung cần tư vấn</li>
                <li>Theo dõi trạng thái lịch hẹn</li>
              </ul>

              <div className={styles.visualNote}>
                * Nếu bạn đang trong tình trạng khẩn cấp, hãy liên hệ người thân hoặc cơ sở y tế gần nhất.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Blog ===== */}
      <main className={styles.main}>
        <section className={styles.blog}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Bài viết chuyên môn</h2>
            <p className={styles.sectionDesc}>
              Nội dung ngắn gọn – dễ đọc – tập trung vào hỗ trợ thực tế cho người dùng.
            </p>
          </div>

          <div className={styles.blogGrid}>
            {BLOG.map((p) => (
              <article key={p.id} className={styles.postCard}>
                <div className={`${styles.thumb} ${styles[`tone_${p.tone}`]}`} />
                <div className={styles.postBody}>
                  <div className={styles.postMeta}>
                    <span className={styles.postTag}>{p.category}</span>
                    <span className={styles.postDot}>•</span>
                    <span className={styles.postInfo}>{p.readTime}</span>
                    <span className={styles.postDot}>•</span>
                    <span className={styles.postInfo}>{p.date}</span>
                  </div>

                  <h3 className={styles.postTitle}>{p.title}</h3>
                  <p className={styles.postExcerpt}>{p.excerpt}</p>

                  <div className={styles.postActions}>
                    {/* demo: chưa có route blog thì dùng button giả lập */}
                    <button className={styles.readMoreBtn} type="button">
                      Đọc thêm
                    </button>
                    <span className={styles.readHint}>Mở rộng nội dung sau</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <div>
              <h3 className={styles.ctaTitle}>Bạn cần tư vấn ngay hôm nay?</h3>
              <p className={styles.ctaDesc}>
                Đặt lịch nhanh — theo dõi trạng thái — được hỗ trợ bởi chuyên viên phù hợp.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link to="/appointments/book" className={styles.primaryBtn}>
                Đặt lịch tư vấn
              </Link>
              <Link to="/appointments" className={styles.ghostBtn}>
                Xem lịch hẹn
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            © 2025 – Hệ thống Tư vấn tâm lý & Phòng chống tệ nạn
          </div>
          <div className={styles.footerRight}>
            <span>Chính sách bảo mật</span>
            <span>Điều khoản</span>
            <span>Liên hệ</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
